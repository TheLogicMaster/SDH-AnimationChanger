"""Exercise the backend's filesystem behavior without Decky or network imports."""
import ast
import asyncio
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import AsyncMock, Mock, patch


def load_backend():
    source = Path(__file__).resolve().parents[1] / 'main.py'
    tree = ast.parse(source.read_text(encoding='utf-8'))
    # Execute the real backend functions, including Plugin._main(), while
    # keeping optional Decky/network imports and import-time SSL setup out.
    definitions = [node for node in tree.body
                   if isinstance(node, (ast.FunctionDef, ast.ClassDef))]
    namespace = {'os': os, 'asyncio': asyncio}
    exec(compile(ast.Module(body=definitions, type_ignores=[]), str(source), 'exec'), namespace)
    return namespace


class SteamPathTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.home = Path(self.temporary.name).resolve()
        self.root = self.home / '.steam/root'
        self.canonical = self.home / '.local/share/Steam'
        # Patch only expansion, not the process HOME or real filesystem paths.
        original_expanduser = os.path.expanduser

        def expanduser(path):
            if path == '~' or path.startswith('~/'):
                return str(self.home / path[2:]) if path != '~' else str(self.home)
            return original_expanduser(path)

        self.expansion = patch('os.path.expanduser', side_effect=expanduser)
        self.expansion.start()
        self.addCleanup(self.expansion.stop)
        self.backend = load_backend()
        self.backend.update({
            'decky_plugin': Mock(),
            'ANIMATIONS_PATH': str(self.home / 'plugin/animations'),
            'DOWNLOADS_PATH': str(self.home / 'plugin/downloads'),
            'CONFIG_PATH': str(self.home / 'plugin/settings/config.json'),
            'BOOT_VIDEO': 'deck_startup.webm',
            'SUSPEND_VIDEO': 'steam_os_suspend.webm',
            'THROBBER_VIDEO': 'steam_os_suspend_from_throbber.webm',
            'VIDEOS_NAMES': ['deck_startup.webm', 'steam_os_suspend.webm',
                             'steam_os_suspend_from_throbber.webm'],
            'VIDEO_TYPES': ['boot', 'suspend', 'throbber'],
            'config': {'boot': '', 'suspend': '', 'throbber': '', 'randomize': '',
                       'downloads': [], 'custom_animations': []},
            'local_animations': [],
            'unloaded': False,
        })
        self.backend['load_config'] = AsyncMock()
        self.backend['update_cache'] = AsyncMock()

    def movies(self, root):
        return root / 'config/uioverrides/movies'

    def resolved_movies(self):
        return Path(self.backend['get_override_path']())

    def startup(self):
        with patch.object(asyncio, 'sleep', new=AsyncMock()):
            asyncio.run(self.backend['Plugin']()._main())

    def link(self, path, target):
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            path.symlink_to(target, target_is_directory=True)
        except OSError as error:
            if os.name == 'nt' and getattr(error, 'winerror', None) == 1314:
                self.skipTest('Windows symlink privilege is unavailable; run on Linux')
            raise

    def link_root(self, target):
        self.link(self.root, target)

    def test_resolution_does_not_create_any_directories(self):
        self.assertEqual(self.resolved_movies(), self.movies(self.canonical))
        self.assertEqual(list(self.home.iterdir()), [])

    def test_startup_before_steam_does_not_create_compatibility_root(self):
        self.startup()
        self.assertTrue(self.movies(self.canonical).is_dir())
        self.assertFalse(os.path.lexists(self.root))

    @unittest.skipUnless(os.name == 'posix' and shutil.which('ln'), 'Requires Unix ln')
    def test_steam_bootstrap_creates_root_link_without_nested_link(self):
        self.startup()
        self.root.parent.mkdir()
        subprocess.run(['ln', '-sfn', str(self.canonical), str(self.root)], check=True)
        self.assertTrue(self.root.is_symlink())
        self.assertEqual(self.root.resolve(), self.canonical)
        self.assertFalse(os.path.lexists(self.root / 'Steam'))
        self.assertEqual(self.movies(self.root).resolve(), self.movies(self.canonical))

    def test_existing_standard_root_link_is_preserved(self):
        self.canonical.mkdir(parents=True)
        self.link_root(self.canonical)
        original_target = os.readlink(self.root)
        self.startup()
        self.assertEqual(os.readlink(self.root), original_target)
        self.assertEqual(self.resolved_movies(), self.movies(self.canonical))

    def test_custom_root_link_and_user_files_are_preserved(self):
        target = self.home / 'custom Steam'
        movies = self.movies(target)
        movies.mkdir(parents=True)
        (movies / 'personal.webm').write_bytes(b'keep my movie')
        (target / 'userdata').mkdir()
        (target / 'userdata/settings').write_bytes(b'keep my settings')
        self.link_root(target)
        original_target = os.readlink(self.root)
        self.startup()
        self.assertEqual(self.resolved_movies(), movies)
        self.assertEqual(os.readlink(self.root), original_target)
        self.assertEqual((movies / 'personal.webm').read_bytes(), b'keep my movie')
        self.assertEqual((target / 'userdata/settings').read_bytes(), b'keep my settings')
        self.assertFalse(self.canonical.exists())

    def test_relative_root_link_is_preserved(self):
        target = self.home / 'custom Steam'
        target.mkdir()
        self.link_root(Path('..') / 'custom Steam')
        self.startup()
        self.assertEqual(self.resolved_movies(), self.movies(target))
        self.assertEqual(os.readlink(self.root), str(Path('..') / 'custom Steam'))

    def test_dangling_custom_root_link_uses_its_existing_target(self):
        target = self.home / 'not created yet'
        self.link_root(target)
        self.assertFalse(self.root.exists())
        original_target = os.readlink(self.root)
        self.startup()
        self.assertTrue(self.movies(target).is_dir())
        self.assertEqual(os.readlink(self.root), original_target)
        self.assertFalse(self.canonical.exists())

    def test_existing_real_root_directory_and_contents_are_preserved(self):
        self.root.mkdir(parents=True)
        (self.root / 'keep.dat').write_bytes(b'user data')
        self.startup()
        self.assertFalse(self.root.is_symlink())
        self.assertEqual(self.resolved_movies(), self.movies(self.root))
        self.assertEqual((self.root / 'keep.dat').read_bytes(), b'user data')
        self.assertFalse(self.canonical.exists())

    def test_malformed_root_is_not_migrated_or_deleted(self):
        movies = self.movies(self.root)
        movies.mkdir(parents=True)
        (movies / 'personal.webm').write_bytes(b'keep overrides')
        self.canonical.mkdir(parents=True)
        (self.canonical / 'userdata').write_bytes(b'keep Steam data')
        self.link(self.root / 'Steam', self.canonical)
        self.startup()
        self.assertFalse(self.root.is_symlink())
        self.assertEqual((movies / 'personal.webm').read_bytes(), b'keep overrides')
        self.assertEqual((self.canonical / 'userdata').read_bytes(), b'keep Steam data')
        self.assertEqual((self.root / 'Steam').resolve(), self.canonical)

    def test_existing_root_file_fails_without_overwriting_it(self):
        self.root.parent.mkdir()
        self.root.write_bytes(b'do not overwrite')
        with self.assertRaises(OSError):
            self.startup()
        self.assertEqual(self.root.read_bytes(), b'do not overwrite')
        self.assertFalse(self.canonical.exists())

    def test_apply_honors_link_created_after_plugin_startup(self):
        self.startup()
        old_movie = self.movies(self.canonical) / 'deck_startup.webm'
        old_movie.write_bytes(b'keep previous destination')
        target = self.home / 'late custom Steam'
        target.mkdir()
        self.link_root(target)
        source = self.home / 'selected.webm'
        source.write_bytes(b'animation')
        self.backend['config']['custom_animations'] = [{'id': 'chosen', 'path': str(source)}]
        self.backend['apply_animation']('deck_startup.webm', 'chosen')
        override = self.movies(target) / 'deck_startup.webm'
        self.assertTrue(override.is_symlink())
        self.assertEqual(override.resolve(), source)
        self.assertEqual(source.read_bytes(), b'animation')
        self.assertEqual(old_movie.read_bytes(), b'keep previous destination')

    def test_clear_removes_only_selected_override_and_keeps_animation_source(self):
        target = self.home / 'custom Steam'
        self.link_root(target)
        source = self.home / 'selected.webm'
        source.write_bytes(b'animation')
        self.backend['config']['custom_animations'] = [{'id': 'chosen', 'path': str(source)}]
        self.backend['apply_animation']('deck_startup.webm', 'chosen')
        other = self.movies(target) / 'personal.webm'
        other.write_bytes(b'keep')
        self.backend['apply_animation']('deck_startup.webm', '')
        self.assertFalse(os.path.lexists(self.movies(target) / 'deck_startup.webm'))
        self.assertEqual(other.read_bytes(), b'keep')
        self.assertEqual(source.read_bytes(), b'animation')


if __name__ == '__main__':
    unittest.main()
