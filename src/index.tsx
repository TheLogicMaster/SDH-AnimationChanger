import {
    ButtonItem,
    definePlugin,
    PanelSection,
    PanelSectionRow,
    ServerAPI,
    staticClasses,
    ToggleField,
    DropdownItem,
    DropdownOption
} from "decky-frontend-lib";
import {useEffect, useState, VFC} from "react";
import {FaRandom} from "react-icons/fa";

interface SaveConfigArgs {
    current: number
    randomize: boolean
}

interface LoadConfigArgs {
    current: number
    randomize: boolean
    animations: string[]
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({serverAPI}) => {
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

export default definePlugin((serverApi: ServerAPI) => {
    return {
        title: <div className={staticClasses.Title}>Animation Changer</div>,
        content: <Content serverAPI={serverApi}/>,
        icon: <FaRandom/>
    };
});
