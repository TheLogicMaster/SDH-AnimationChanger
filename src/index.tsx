import {
    ButtonItem,
    definePlugin,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
    staticClasses,
    ToggleField,
    DropdownItem,
    DropdownOption,
    Tabs,
    Router
} from "decky-frontend-lib";

import { useEffect, useState, FC } from "react";
import { FaRandom } from "react-icons/fa";

import { AnimationProvider, useAnimationContext } from './state';

import {
    AnimationBrowserPage,
    AboutPage,
    InstalledAnimationsPage
} from "./animation-manager";


const Content: FC = () => {

    const { allAnimations, settings, saveSettings } = useAnimationContext();

    const animationOptions = () => {
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

        return options;
    }

    return (
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

            <PanelSectionRow> 
               <DropdownItem
                label="Boot Animation"
                menuLabel="Boot Animation"
                rgOptions={animationOptions()}
                selectedOption=''
                onChange={({ data }) => {
                    saveSettings({ ...settings, boot: data });
                }}/>
            </PanelSectionRow>

            {/*<PanelSectionRow>*/}
            {/*    <DropdownItem*/}
            {/*        menuLabel="Current Set"*/}
            {/*        description="The current animation"*/}
            {/*        rgOptions={}*/}
            {/*        selectedOption={}*/}
            {/*        onChange={async (data) => {*/}
            {/*            */}
            {/*        }}*/}
            {/*    />*/}
            {/*</PanelSectionRow>*/}

            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    description="Randomize the current set"
                    onClick={async () => {

                    }}
                >
                    Randomize
                </ButtonItem>
            </PanelSectionRow>

            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    description="Randomize, shuffling animations"
                    onClick={async () => {

                    }}
                >
                    Shuffle
                </ButtonItem>
            </PanelSectionRow>

            {/*<PanelSectionRow>*/}
            {/*    <DropdownItem*/}
            {/*        menuLabel="Suspend Animatiom"*/}
            {/*        rgOptions={}*/}
            {/*        selectedOption={}*/}
            {/*        onChange={async (data) => {*/}
            {/*            */}
            {/*        }}*/}
            {/*    />*/}
            {/*</PanelSectionRow>*/}

            {/*<PanelSectionRow>*/}
            {/*    <DropdownItem*/}
            {/*        menuLabel="Throbber Animatiom"*/}
            {/*        rgOptions={}*/}
            {/*        selectedOption={}*/}
            {/*        onChange={async (data) => {*/}
            {/*            */}
            {/*        }}*/}
            {/*    />*/}
            {/*</PanelSectionRow>*/}

        </PanelSection>
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
