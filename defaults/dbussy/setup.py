#+
# Setuptools script to install DBussy. Make sure setuptools
# <https://setuptools.pypa.io/en/latest/index.html> is installed.
# Invoke from the command line in this directory as follows:
#
#     python3 setup.py build
#     sudo python3 setup.py install
#
# Written by Lawrence D'Oliveiro <ldo@geek-central.gen.nz>.
#-

import sys
import setuptools
from setuptools.command.build_py import \
    build_py as std_build_py

class my_build_py(std_build_py) :
    "customization of build to perform additional validation."

    def run(self) :
        try :
            exec \
              (
                "async def dummy() :\n"
                "    pass\n"
                "#end dummy\n"
              )
        except SyntaxError :
            sys.stderr.write("This module requires Python 3.5 or later.\n")
            sys.exit(-1)
        #end try
        super().run()
    #end run

#end my_build_py

setuptools.setup \
  (
    name = "DBussy",
    version = "1.3",
    description = "language bindings for libdbus, for Python 3.5 or later",
    long_description = "language bindings for libdbus, for Python 3.5 or later",
    author = "Lawrence D'Oliveiro",
    author_email = "ldo@geek-central.gen.nz",
    url = "https://github.com/ldo/dbussy",
    license = "LGPL v2.1+",
    py_modules = ["dbussy", "ravel"],
    cmdclass =
        {
            "build_py" : my_build_py,
        },
  )
