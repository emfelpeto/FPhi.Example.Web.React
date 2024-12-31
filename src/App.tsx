/**
 * Implementation of Selphi Web Widget in React Framework
 *
 * WARNING:
 * This is an example of the implementation of the Web Widget. All the properties, methods, events and results used in this examples are used as orientation to a better performance in coding.
 *
 * Please, consider to check the documentation before editing the code.
 *
 * We recommend to replace all the console logs with actual code.
 *
 */

import { createRef, DOMAttributes, Ref, useEffect, useState } from "react";
import { FPhi, WidgetComponent, WidgetCheckCapabilities, ExceptionCapturedEvent, ExtractionFinishEvent, ExtractionTimeoutEvent,  ModuleLoadedEvent, StabilizingEvent, TrackStatusEvent } from "@facephi/selphi-widget-web";

import './App.css';

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['facephi-selphi']: CustomElement<WidgetComponent>;
        }
    }
}

type MapType = {
    [id: string]: { title: string, width: number, height: number };
}

const App = () => {
    //#region Demo configuration

    const [isWidgetCaptureStarted, setIsWidgetCaptureStarted] = useState(false);
    const FPhiCameraResolutions: MapType = {
        res480p: {title: "640x480", width: 640, height: 480},
        res600p: {title: "800x600", width: 800, height: 600},
        res768p: {title: "1024x768", width: 1024, height: 768},
        res720p: {title: "1280x720 (720p)", width: 1280, height: 720},
        res1080p: {title: "1920x1080 (1080p)", width: 1920, height: 1080},
    };
    const demoCameraResolution = 'res720p';

    async function onStartCapture() {
        console.warn("[Demo] Start Capture");
        (document.getElementById("widgetEventResult") as HTMLElement).innerText = '';
        const capabilities: WidgetCheckCapabilities = await checkCapabilities();
        if (capabilities.camera && capabilities.wasm && capabilities.browser) {
            setIsWidgetCaptureStarted(true);
        } else {
            // ...
        }
    }

    function onStopCapture() {
        console.warn("[Demo] Stop Capture");
        (document.getElementById("widgetEventResult") as HTMLElement).innerText = '';
        setIsWidgetCaptureStarted(false);
    }

    function onCameraResolutionChange(event: any) {
        setCameraWidth(FPhiCameraResolutions[event.target.value].width);
        setCameraHeight(FPhiCameraResolutions[event.target.value].height);
    }

    //#endregion

    //#region Widget Configuration

    const widgetRef: Ref<HTMLElement> = createRef();
    const [componentMounted, setComponentMounted] = useState(false);

    // Initialize configuration properties
    const bundlePath = "/assets/selphi";
    const language = "es";
    const [cameraWidth, setCameraWidth] = useState(FPhiCameraResolutions.res720p.width);
    const [cameraHeight, setCameraHeight] = useState(FPhiCameraResolutions.res720p.height);
    const [cameraType, setCameraType] = useState(FPhi.Selphi.CameraType.Front);
    const [interactible, setInteractible] = useState(true);
    const [stabilizationStage, setStabilizationStage] = useState(true);
    const [cameraSwitchButton, setCameraSwitchButton] = useState(false);
    const [faceTracking, setFaceTracking] = useState(false);
    const timeout = 30000;
    const imageFormat = "image/jpeg";
    const imageQuality = 0.95;
    const cropFactor = 1.5;
    const [showLog, setShowLog] = useState(false);

    useEffect(() => {
        if (!componentMounted) {
            setComponentMounted(true);
        } else {
            if (isWidgetCaptureStarted) {
                const node = widgetRef.current as WidgetComponent;

                // Setup widget event handlers
                node?.addEventListener("onModuleLoaded", onModuleLoaded)
                node?.addEventListener("onStabilizing", onStabilizing)
                node?.addEventListener("onExtractionFinish", onExtractionFinish)
                node?.addEventListener("onUserCancel", onUserCancel)
                node?.addEventListener("onExceptionCaptured", onExceptionCaptured)
                node?.addEventListener("onExtractionTimeout", onExtractionTimeout)
                node?.addEventListener("onTimeoutErrorButtonClick", onTimeoutErrorButtonClick)
                node?.addEventListener("onTrackStatus", onTrackStatus)
            }
        }
    }, [componentMounted, isWidgetCaptureStarted, widgetRef]);

    // Widget event handlers
    function onModuleLoaded(event: ModuleLoadedEvent) {
        const result = event.detail;
        console.warn("[Selphi] onModuleLoaded", event);
        console.log(result);
    }

    function onExtractionFinish(extractionResult: ExtractionFinishEvent) {
        const result = extractionResult.detail;
        console.warn("[Selphi] onExtractionFinish");
        console.log(result);

        if (result?.bestImageTokenized) {
            // Continue process.
        } else {
            // ...
        }

        setIsWidgetCaptureStarted(false);
        (document.getElementById("widgetEventResult") as HTMLElement).innerText = 'Success! Extraction complete';
    }

    function onExceptionCaptured(exceptionResult: ExceptionCapturedEvent) {
        const result = exceptionResult.detail;
        console.warn("[Selphi] onExceptionCaptured");
        console.log(result);

        switch (result?.exceptionType) {
            case (FPhi.Selphi.ExceptionType.CameraError):
                console.error("Camera Error");
                // ...
                break;
            case (FPhi.Selphi.ExceptionType.UnexpectedCaptureError):
                console.error("Unexpected Error");
                // ...
                break;
            case (FPhi.Selphi.ExceptionType.InitializingEngineError):
                console.error("Engine Error");
                // ...
                break;
            default:
                console.error(result?.message);
        }

        setIsWidgetCaptureStarted(false);
        (document.getElementById("widgetEventResult") as HTMLElement).innerText = 'Error! Something went wrong';
    }

    function onUserCancel() {
        console.warn("[Selphi] onUserCancel");
        console.log("The widget has been closed");

        setIsWidgetCaptureStarted(false);
        (document.getElementById("widgetEventResult") as HTMLElement).innerText = 'Error! The extraction has been cancelled';
    }

    function onExtractionTimeout(timeoutResult: ExtractionTimeoutEvent) {
        const result = timeoutResult.detail;
        console.warn("[Selphi] onExtractionTimeout");
        console.log(result);

        (document.getElementById("widgetEventResult") as HTMLElement).innerText = 'Error! Time limit exceeded';
    }

    function onTimeoutErrorButtonClick() {
        console.warn("[Selphi] onTimeoutErrorButtonClick");

        setIsWidgetCaptureStarted(false);
    }

    function onStabilizing(stabilizingResult: StabilizingEvent) {
        const result = stabilizingResult.detail;
        console.warn("[Selphi] onStabilizing");
        console.log(result);
    }

    function onTrackStatus(event: TrackStatusEvent) {
        const result = event.detail;
        const trackStatusCode: any = Object.entries(FPhi.Selphi.TrackStatus).find((e: any) => e[1] === result?.code);
        console.warn(`[Selphi] onTrackStatus (Code: ${trackStatusCode[1]} - ${trackStatusCode[0]}, Timestamp: ${result?.timeStamp}`);
        console.log(result);
    }

    // Widget methods
    async function checkCapabilities(): Promise<WidgetCheckCapabilities> {
        // Check device capabilities (browser, memory, webassembly...) with checkCapabilities method
        const capabilities: any = await FPhi.Selphi.CheckCapabilities();
        console.log("Selphi: Widget Check Capabilities Check:\n", capabilities);
        return capabilities;
    }

    //#endregion

    return (
        <div className="container p-3">
            <div className="row h-100">
                {/* Selphi Web Widget Container */}
                <div id="fPhiWidgetContainer" className="col-12 col-md-9" style={{minHeight: 550}}>
                    {isWidgetCaptureStarted &&
                        <facephi-selphi
                            ref={widgetRef}
                            className="h-100"

                            // Setup propierties
                            bundlePath={bundlePath}
                            language={language}
                            cameraWidth={cameraWidth}
                            cameraHeight={cameraHeight}
                            cameraType={cameraType}
                            interactible={interactible}
                            stabilizationStage={stabilizationStage}
                            cameraSwitchButton={cameraSwitchButton}
                            faceTracking={faceTracking}
                            timeout={timeout}
                            imageFormat={imageFormat}
                            imageQuality={imageQuality}
                            cropFactor={cropFactor}
                            showLog={showLog}
                        />
                    }
                    <div id="widgetEventResult" style={{position: "absolute", top: 0}} />
                </div>

                {/* Widget demo configuration elements */}
                <div className="col-12 col-md-3 mt-3 mt-md-0">
                    <div>Selphi Web Widget Demo</div>

                    <div className="my-3">
                        <button type="button" id="btnStartCapture" className="btn btn-primary btn-block"
                                onClick={onStartCapture} disabled={isWidgetCaptureStarted}>
                            Start capture
                        </button>
                        <button type="button" id="btnStopCapture" className="btn btn-danger btn-block"
                                onClick={onStopCapture} disabled={!isWidgetCaptureStarted}>
                            Stop capture
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cameraResolution">Camera resolution</label>
                        <select
                            id="cameraResolution"
                            className="form-control"
                            defaultValue={demoCameraResolution}
                            onChange={onCameraResolutionChange}
                            disabled={isWidgetCaptureStarted}
                        >
                            {Object.keys(FPhiCameraResolutions).map(key =>
                                <option key={key} value={key}>
                                    {FPhiCameraResolutions[key].title}
                                </option>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="cameraType">Camera type</label>
                        <select id="cameraType"
                                className="form-control"
                                value={cameraType}
                                onChange={(e: any) => setCameraType(e.target.value)}
                                disabled={isWidgetCaptureStarted}>
                            {Object.entries(FPhi.Selphi.CameraType)
                                .map(mode =>  ({key: mode[0], value: mode[1]}))
                                .map(mode => <option value={mode.value} key={mode.value}>{mode.key}</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group form-check m-0">
                        <input id="interactible" type="checkbox" className="form-check-input"
                               checked={interactible} onChange={e => setInteractible(e.target.checked) } disabled={isWidgetCaptureStarted}/>
                        <label htmlFor="interactible" className="form-check-label">Interactible</label>
                    </div>
                    <div className="form-group form-check m-0">
                        <input id="stabilizationStage" type="checkbox" className="form-check-input"
                               checked={stabilizationStage} onChange={e => setStabilizationStage(e.target.checked) } disabled={isWidgetCaptureStarted}/>
                        <label htmlFor="stabilizationStage" className="form-check-label">Stabilization stage</label>
                    </div>
                    <div className="form-group form-check m-0">
                        <input id="faceTracking" type="checkbox" className="form-check-input"
                               checked={faceTracking} onChange={e => setFaceTracking(e.target.checked)} disabled={isWidgetCaptureStarted}/>
                        <label htmlFor="faceTracking" className="form-check-label">Face Tracking</label>
                    </div>
                    <div className="form-group form-check m-0">
                        <input type="checkbox" id="cameraSwitchButton" className="form-check-input"
                               checked={cameraSwitchButton} onChange={e => setCameraSwitchButton(e.target.checked)} disabled={isWidgetCaptureStarted}/>
                        <label htmlFor="cameraSwitchButton" className="form-check-label">Camera switch button</label>
                    </div>
                    <div className="form-group form-check m-0">
                        <input type="checkbox" id="showLog" className="form-check-input"
                               checked={showLog} onChange={e => setShowLog(e.target.checked)} disabled={isWidgetCaptureStarted}/>
                        <label htmlFor="showLog" className="form-check-label">Show extended log</label>
                    </div>

                    <div className="form-group">
                        <div>Widget Version: <span id="widgetVersion">{ FPhi.Selphi.Version }</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;