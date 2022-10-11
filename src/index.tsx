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

import { AnimationProvider } from './state';


import {
    AnimationBrowserPage,
    AboutPage,
    UninstallAnimationPage
} from "./animation-manager";

interface SaveConfigArgs {
    current: number
    randomize: boolean
}

interface LoadConfigArgs {
    current: number
    randomize: boolean
    animations: string[]
}

const Content: FC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
    const [randomize, setRandomize] = useState<boolean>(false);
    const [animations, setAnimations] = useState<DropdownOption[]>([]);
    const [current, setCurrent] = useState<number>(0);

    const showError = (msg: string) => {
        serverAPI.toaster.toast({
            title: <div>Animation Changer Error</div>,
            body: <div>{msg}</div>
        })
    }

    const saveConfig = async (current: number, randomize: boolean) => {
        const result = await serverAPI.callPluginMethod<SaveConfigArgs, {}>(
            "saveConfig",
            {
                current: current,
                randomize: randomize
            }
        );
        if (!result.success)
            showError(result.result)
    };

    const loadConfig = async () => {
        const result = await serverAPI.callPluginMethod<{}, LoadConfigArgs>("loadConfig", {});
        if (result.success) {
            let newAnimations: DropdownOption[] = [{data: 0, label: "Default"}]
            for (let i = 0; i < result.result.animations.length; i++) {
                newAnimations.push({
                    data: i + 1,
                    label: result.result.animations[i]
                })
            }
            setAnimations(newAnimations)
            setCurrent(result.result.current)
            setRandomize(result.result.randomize)
        } else
            showError(result.result)
    };

    useEffect(() => {
        loadConfig().then()
    }, []);

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
                <ToggleField
                    label="Randomize on Boot"
                    description="Select a new animation on boot-up"
                    checked={randomize}
                    onChange={async (randomize: boolean) => {
                        await saveConfig(current, randomize)
                        setRandomize(randomize)
                    }}
                />
            </PanelSectionRow>

            <PanelSectionRow>
                <DropdownItem
                    menuLabel="Current"
                    description="The current animation"
                    rgOptions={animations}
                    selectedOption={current}
                    onChange={async (data) => {
                        await saveConfig(data.data, randomize)
                        setCurrent(data.data)
                    }}
                />
            </PanelSectionRow>

            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    description="Randomize the current animation"
                    onClick={async () => {
                        let newCurrent = Math.floor(Math.random() * (animations.length - 1)) + 1
                        await saveConfig(newCurrent, randomize)
                        setCurrent(newCurrent)
                    }}
                >
                    Randomize
                </ButtonItem>
            </PanelSectionRow>

            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    description="Reload configuration and animations"
                    onClick={async () => {
                        await loadConfig()
                    }}
                >
                    Reload
                </ButtonItem>
            </PanelSectionRow>
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
                    content: <UninstallAnimationPage />,
                    id: "UninstallAnimations",
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
                <Content serverAPI={serverApi}/>
            </AnimationProvider>
        ),
        icon: <FaRandom/>
    };

});
