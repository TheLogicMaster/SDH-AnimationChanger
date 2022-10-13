import {
    ButtonItem,
    definePlugin,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
    staticClasses,
    DropdownItem,
    Tabs,
    Router,
    useQuickAccessVisible
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

    const { allAnimations, settings, saveSettings, loadBackendState, lastSync, reloadConfig } = useAnimationContext();
    const qamVisible = useQuickAccessVisible();

    const [ animationOptions, setAnimationOptions ] = useState([{
        label: 'Default',
        data: ''
    }]);

    useEffect(() => {
        loadBackendState();
    }, [ qamVisible ]);

    useEffect(() => {

        let options = allAnimations.map((animation) => {
            return {
                label: animation.name,
                data: animation.id
            }
        });

        options.unshift({
            label: 'Default',
            data: ''
        });

        setAnimationOptions(options);

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
                    rgOptions={animationOptions}
                    selectedOption={settings.boot}
                    onChange={({ data }) => {
                        saveSettings({ ...settings, boot: data });
                    }}/>
                </PanelSectionRow>

                <PanelSectionRow> 
                    <DropdownItem
                    label="Suspend"
                    menuLabel="Suspend Animation"
                    rgOptions={animationOptions}
                    selectedOption={settings.suspend}
                    onChange={({ data }) => {
                        saveSettings({ ...settings, suspend: data });
                    }}/>
                </PanelSectionRow>

                <PanelSectionRow> 
                    <DropdownItem
                    label="Throbber"
                    menuLabel="Throbber Animation"
                    rgOptions={animationOptions}
                    selectedOption={settings.throbber}
                    onChange={({ data }) => {
                        saveSettings({ ...settings, throbber: data });
                    }}/>
                </PanelSectionRow>

                

            </PanelSection>
            <PanelSection>
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

    return (
        <div
            style={{
            marginTop: "40px",
            height: "calc(100% - 40px)",
            background: "#0005",
            }}
        >
            <Tabs
            title="Animation Manager"
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
                },
                {
                    title: "Installed Animations",
                    content: <InstalledAnimationsPage />,
                    id: "InstalledAnimations",
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
