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
            title: <div>Error</div>,
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
                    onChange={(randomize: boolean) => {
                        saveConfig(current, randomize).then()
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
                    onChange={(data) => {
                        saveConfig(data.data, randomize).then()
                        setCurrent(data.data)
                    }}
                />
            </PanelSectionRow>

            <PanelSectionRow>
                <ButtonItem
                    layout="below"
                    description="Randomize the current animation"
                    onClick={() => {
                        let newCurrent = Math.floor(Math.random() * (animations.length - 1)) + 1
                        saveConfig(newCurrent, randomize).then()
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
                    onClick={() => {
                        loadConfig().then()
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
        title: <div className={staticClasses.Title}>Animation Changer Plugin</div>,
        content: <Content serverAPI={serverApi}/>,
        icon: <FaRandom/>
    };
});
