import {
    ButtonItem,
    definePlugin,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
    staticClasses,
    DropdownItem,
    DropdownOption,
    Tabs,
    Router,
    ToggleField,
    findModule
} from "decky-frontend-lib";

import { useEffect, useState, FC, useMemo } from "react";
import { FaRandom } from "react-icons/fa";

import { AnimationProvider, useAnimationContext } from './state';

import {
    AnimationBrowserPage,
    AboutPage,
    InstalledAnimationsPage
} from "./animation-manager";

const Content: FC = () => {

    const { allAnimations, settings, saveSettings, loadBackendState, lastSync, reloadConfig, shuffle } = useAnimationContext();

    const [ bootAnimationOptions, setBootAnimationOptions ] = useState<DropdownOption[]>([]);
    const [ suspendAnimationOptions, setSuspendAnimationOptions ] = useState<DropdownOption[]>([]);

    // Removed QAM Visible hook due to crash
    useEffect(() => {
        loadBackendState();
    }, []);

    useEffect(() => {

        let bootOptions = allAnimations.filter(anim => anim.target === 'boot').map((animation) => {
            return {
                label: animation.name,
                data: animation.id
            }
        });

        bootOptions.unshift({
            label: 'Default',
            data: ''
        });
        
        setBootAnimationOptions(bootOptions);

        // Todo: Extract to function rather than duplicate
        let suspendOptions = allAnimations.filter(anim => anim.target === 'suspend').map((animation) => {
            return {
                label: animation.name,
                data: animation.id
            }
        });
        
        suspendOptions.unshift({
            label: 'Default',
            data: ''
        });
        
        setSuspendAnimationOptions(suspendOptions);

    }, [ lastSync ]);

    return (
        <>
            <PanelSection>
                <PanelSectionRow>
                    <ButtonItem
                    layout="below"
                    onClick={() => {
                        Router.CloseSideMenus();
                        Router.Navigate('/animation-manager');
                    }}
                    >
                    Manage Animations
                    </ ButtonItem>
                </PanelSectionRow>
            </PanelSection>
            <PanelSection title="Animations">

                <PanelSectionRow> 
                    <DropdownItem
                    label="Boot"
                    menuLabel="Boot Animation"
                    rgOptions={bootAnimationOptions}
                    selectedOption={settings.boot}
                    onChange={({ data }) => {
                        saveSettings({ ...settings, boot: data });
                    }}/>
                </PanelSectionRow>

                <PanelSectionRow> 
                    <DropdownItem
                    label="Suspend"
                    menuLabel="Suspend Animation"
                    rgOptions={suspendAnimationOptions}
                    selectedOption={settings.suspend}
                    onChange={({ data }) => {
                        saveSettings({ ...settings, suspend: data });
                    }}/>
                </PanelSectionRow>

                <PanelSectionRow> 
                    <DropdownItem
                    label="Throbber"
                    menuLabel="Throbber Animation"
                    rgOptions={suspendAnimationOptions}
                    selectedOption={settings.throbber}
                    onChange={({ data }) => {
                        saveSettings({ ...settings, throbber: data });
                    }}/>
                </PanelSectionRow>

                <PanelSectionRow>
                    <ButtonItem
                    layout="below"
                    onClick={shuffle}
                    >
                       Shuffle
                    </ButtonItem>
                </PanelSectionRow>


            </PanelSection>
            <PanelSection title='Settings'>
                <PanelSectionRow>
                    <ToggleField
                    label='Shuffle on Boot'
                    onChange={(checked) => { saveSettings({ ...settings, randomize: (checked) ? 'all' : '' }) }}
                    checked={settings.randomize == 'all'}
                    />
                </PanelSectionRow>

                <PanelSectionRow>
                    <ButtonItem
                    layout="below"
                    onClick={reloadConfig}
                    >
                        Reload Config
                    </ButtonItem>
                </PanelSectionRow>
            </PanelSection>
        </>
    );
};


const AnimationManagerRouter: FC = () => {

    const [ currentTabRoute, setCurrentTabRoute ] = useState<string>("AnimationBrowser");
    const { repoResults, downloadedAnimations } = useAnimationContext();

    const { TabCount } = findModule((mod) => {
        if (typeof mod !== 'object') return false;
      
        if (mod.TabCount && mod.TabTitle) {
          return true;
        }
      
        return false;
    });

    return (
        <div
            style={{
            marginTop: "40px",
            height: "calc(100% - 40px)",
            background: "#0005",
            }}
        >
            <Tabs
            activeTab={currentTabRoute}
            // @ts-ignore
            onShowTab={(tabID: string) => {
                setCurrentTabRoute(tabID);
            }}
            tabs={[
                {
                    title: "Browse Animations",
                    content: <AnimationBrowserPage />,
                    id: "AnimationBrowser",
                    renderTabAddon: () => <span className={TabCount}>{repoResults.length}</span>
                },
                {
                    title: "Installed Animations",
                    content: <InstalledAnimationsPage />,
                    id: "InstalledAnimations",
                    renderTabAddon: () => <span className={TabCount}>{downloadedAnimations.length}</span>
                },
                {
                    title: "About Animation Changer",
                    content: <AboutPage />,
                    id: "AboutAnimationChanger",
                }
            ]}
            />
        </div>
    );
    
};

  
export default definePlugin((serverApi: ServerAPI) => {

    serverApi.routerHook.addRoute("/animation-manager", () => (
        <AnimationProvider serverAPI={serverApi}>
            <AnimationManagerRouter />
        </AnimationProvider>
    ));

    return {
        title: <div className={staticClasses.Title}>Animation Changer</div>,
        content: (
            <AnimationProvider serverAPI={serverApi}>
                <Content />
            </AnimationProvider>
        ),
        icon: <FaRandom/>
    };

});
