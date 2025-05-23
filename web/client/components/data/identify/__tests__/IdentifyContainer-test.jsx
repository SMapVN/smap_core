/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import expect from 'expect';
import ReactDOM from 'react-dom';
import IdentifyContainer from '../IdentifyContainer';
import TestUtils, {act} from 'react-dom/test-utils';
import ConfigUtils from '../../../../utils/ConfigUtils';
import getFeatureButtons from '../../../../plugins/identify/featureButtons';

describe("test IdentifyContainer", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test rendering as panel', () => {
        ReactDOM.render(<IdentifyContainer enabled requests={[{}]}/>, document.getElementById("container"));
        const sidePanel = document.getElementsByClassName('ms-side-panel');
        expect(sidePanel.length).toBe(1);
    });

    it('test rendering as modal', () => {
        ReactDOM.render(<IdentifyContainer enabled requests={[{}]} dock={false}/>, document.getElementById("container"));
        const resizableModal = document.getElementsByClassName('ms-resizable-modal');
        expect(resizableModal.length).toBe(1);
    });

    it('test component with missing responses', () => {
        const Viewer = ({missingResponses}) => <div id="test-viewer-gfi">{missingResponses}</div>;
        ReactDOM.render(
            <IdentifyContainer viewer={Viewer} enabled requests={[{}]}/>,
            document.getElementById("container")
        );
        const testViewer = document.getElementById('test-viewer-gfi');
        expect(testViewer.innerHTML).toBe('1');
    });

    it('test component component uses custom viewer', () => {
        const Viewer = ({responses}) => <div id="test-viewer-gfi">{responses.length}</div>;
        ReactDOM.render(
            <IdentifyContainer enabled requests={[{}, {}]} responses={[{}, {}]} viewer={Viewer} />,
            document.getElementById("container")
        );
        const viewer = document.getElementById("test-viewer-gfi");
        expect(viewer.innerHTML).toBe('2');
    });

    it('test component reverse geocode modal', () => {
        ReactDOM.render(
            <IdentifyContainer
                requests={[{}]} responses={[{}]}
                enableRevGeocode
                point={{latlng: {lat: 40, lng: 10}}}
                enabled
                showModalReverse
                reverseGeocodeData={{display_name: "test response"}} />,
            document.getElementById("container")
        );

        let alertModal = document.getElementsByClassName('ms-alert-center')[0];
        expect(alertModal).toExist();
        expect(alertModal.children[0].innerHTML).toBe('test response');

        ReactDOM.render(
            <IdentifyContainer
                point={{latlng: {lat: 40, lng: 10}}}
                enabled
                showModalReverse={false}
                reverseGeocodeData={{display_name: "test"}} />,
            document.getElementById("container")
        );

        alertModal = document.getElementsByClassName('ms-alert-center')[0];
        expect(alertModal).toNotExist();
    });

    it('test component with warning no queryable layer', () => {

        const testHandlers = {
            clearWarning: () => {}
        };

        const spyClearWarning = expect.spyOn(testHandlers, 'clearWarning');

        ReactDOM.render(
            <IdentifyContainer
                warning={'NO_QUERYABLE_LAYERS'}
                clearWarning={testHandlers.clearWarning}/>,
            document.getElementById("container")
        );

        const alertModal = document.getElementsByClassName('ms-resizable-modal');
        expect(alertModal.length).toBe(1);

        const btns = alertModal[0].querySelectorAll('button.square-button-md');
        expect(btns.length).toBe(1);

        TestUtils.Simulate.click(btns[0]);
        expect(spyClearWarning).toHaveBeenCalled();

    });

    it('test component with z index', () => {
        ReactDOM.render(<IdentifyContainer enabled requests={[{}]} zIndex={7777}/>, document.getElementById("container"));
        const sidePanel = document.getElementsByClassName('ms-side-panel');
        expect(sidePanel.length).toBe(1);
        expect(sidePanel[0].children[0].style.zIndex).toBe('7777');
    });

    it('test default coordinate format from localConfig', () => {
        ConfigUtils.setConfigProp("defaultCoordinateFormat", "aeronautical");
        const defaultFormat = ConfigUtils.getConfigProp('defaultCoordinateFormat');
        const point = {latlng: {lat: 39.86927447817351, lng: -81.91405928134918}};
        let format;
        ReactDOM.render(
            <IdentifyContainer
                enabled
                requests={[{}]}
                enabledCoordEditorButton
                showCoordinateEditor
                point={point}
                formatCoord={format || defaultFormat || "decimal"}
            />, document.getElementById("container"));
        const inputs = document.getElementsByClassName('form-control');
        expect(inputs.length).toBe(8);
        expect(inputs[0].placeholder).toBe("d");
        expect(inputs[0].value).toBe('39');
        expect(inputs[1].placeholder).toBe("m");
        expect(inputs[1].value).toBe('52');
        expect(inputs[2].placeholder).toBe("s");
        expect(inputs[2].value).toBe('9.3881');

        // Clean up defaults
        ConfigUtils.removeConfigProp("defaultCoordinateFormat");
    });

    it('test edit button with PROPERTIES response', () => {
        const funcs = {
            getToolButtons: () => {}
        };

        const getToolButtonsSpy = expect.spyOn(funcs, 'getToolButtons');
        ReactDOM.render(<IdentifyContainer
            enabled
            showEdit
            isEditingAllowed
            getToolButtons={funcs.getToolButtons}
            index={0}
            requests={{}}
            layer
            validResponses={[{format: 'PROPERTIES', layer: {search: {url: 'search_url'}}}]}
            responses={[{format: 'PROPERTIES', layer: {search: {url: 'search_url'}, type: "wms"}}]}/>, document.getElementById("container"));
        expect(getToolButtonsSpy).toHaveBeenCalled();
        expect(getToolButtonsSpy.calls[0].arguments[0].showEdit).toBe(true);
    });

    it('test edit button with TEMPLATE response', () => {
        const funcs = {
            getToolButtons: () => {}
        };

        const getToolButtonsSpy = expect.spyOn(funcs, 'getToolButtons');
        ReactDOM.render(<IdentifyContainer
            enabled
            showEdit
            isEditingAllowed
            getToolButtons={funcs.getToolButtons}
            index={0}
            requests={{}}
            validResponses={[{format: 'TEMPLATE', layer: {search: {url: 'search_url'}}}]}
            responses={[{format: 'TEMPLATE', layer: {search: {url: 'search_url'}, type: "wfs"}}]}/>, document.getElementById("container"));
        expect(getToolButtonsSpy).toHaveBeenCalled();
        expect(getToolButtonsSpy.calls[0].arguments[0].showEdit).toBe(true);
    });

    it('test rendering of Layer selector in Identify panel', () => {
        const requests = [{reqId: 1}, {reqId: 2}];
        const responses = [{layerMetadata: {title: "Layer 1"}}, {layerMetadata: {title: "Layer 2"}}];
        ReactDOM.render(<IdentifyContainer
            enabled
            index={0}
            requests={requests}
            responses={responses}
        />, document.getElementById("container"));
        const layerSelect = document.getElementById("identify-layer-select");
        expect(layerSelect).toExist();
    });

    it('test rendering of layer select and feature buttons in Identify panel', () => {
        const requests = [{reqId: 1}, {reqId: 2}];
        const responses = [{layerMetadata: {title: "Layer 1"}}, {layerMetadata: {title: "Layer 2"}}];
        ReactDOM.render(<IdentifyContainer
            enabled
            index={0}
            requests={requests}
            responses={responses}
        />, document.getElementById("container"));
        const layerRow = document.getElementsByClassName("layer-col");
        expect(layerRow[0].children.length).toBe(3);
        const layerIcon = layerRow[0].children[0];
        const layerSelect = layerRow[0].children[1];
        const featureButtons = layerRow[0].children[2];
        expect(layerIcon.getAttribute('class')).toContain('glyphicon-1-layer');
        expect(layerSelect.getAttribute('id')).toContain('identify-layer-select');
        expect(featureButtons.getAttribute('class')).toContain('btn-group');
    });

    it('test rendering of coordinates viewer and toolbar in Identify panel', () => {
        const requests = [{reqId: 1}, {reqId: 2}];
        const responses = [{layerMetadata: {title: "Layer 1"}}, {layerMetadata: {title: "Layer 2"}}];
        ReactDOM.render(<IdentifyContainer
            enabled
            index={0}
            requests={requests}
            responses={responses}
            point={{latlng: {lat: 1, lng: 1}}}
            showCoordinateEditor={false}
        />, document.getElementById("container"));
        const coordinatesRow = document.getElementsByClassName("coordinates-edit-row");
        expect(coordinatesRow[0].children.length).toBe(3);
        const coordinateIcon = coordinatesRow[0].children[0];
        const coordinateViewer = coordinatesRow[0].children[1];
        const toolbar = coordinatesRow[0].children[2];
        expect(coordinateIcon.getAttribute('class')).toContain('glyphicon-point');
        expect(coordinateViewer.children[0].getAttribute('class')).toContain('coordinates-text');
        expect(toolbar.getAttribute('class')).toContain('btn-group');
    });

    it('test rendering of default feature toolbar buttons', () => {
        const requests = [{reqId: 1}, {reqId: 2}];
        const responses = [{layerMetadata: {title: "Layer 1"}}, {layerMetadata: {title: "Layer 2"}}];
        ReactDOM.render(<IdentifyContainer
            enabled
            index={0}
            requests={requests}
            responses={responses}
            getFeatureButtons={getFeatureButtons}
            point={{latlng: {lat: 1, lng: 1}}}
            showCoordinateEditor={false}
        />, document.getElementById("container"));
        let glyphIcons = document.querySelectorAll('.glyphicon');
        expect(glyphIcons.length).toBe(5);
        expect(glyphIcons.forEach(glyph => glyph.className) !== 'zoom-to').toBeTruthy();
    });

    it('test call onInitPlugin on Close', () => {
        const requests = [{reqId: 1}, {reqId: 2}];
        const callbacks = {
            onInitPlugin: () => {}
        };
        const onInitPluginSpy = expect.spyOn(callbacks, 'onInitPlugin');
        const responses = [{layerMetadata: {title: "Layer 1"}}, {layerMetadata: {title: "Layer 2"}}];
        const CMP = (<IdentifyContainer
            enabled
            index={0}
            requests={requests}
            responses={responses}
            getFeatureButtons={getFeatureButtons}
            point={{latlng: {lat: 1, lng: 1}}}
            showCoordinateEditor={false}
            onInitPlugin={callbacks.onInitPlugin}
        />);
        ReactDOM.render(CMP, document.getElementById("container"));
        const container = document.getElementById('container');
        const closeIcon = container.querySelectorAll('.ms-close');
        TestUtils.Simulate.click(closeIcon[0]);
        TestUtils.act(() => {
            ReactDOM.render(CMP, document.getElementById("container"));
        });
        expect(onInitPluginSpy).toHaveBeenCalled();
        // Test since when the highlight feature is disabled the zoom Icon is not shown
        const zoomIcon = document.querySelector('.glyphicon-zoom-to');
        expect(zoomIcon).toNotExist();
    });

    it('test z index to 1 for coordinate-editor if editor is active ', () => {
        const requests = [{reqId: 1}, {reqId: 2}];
        const responses = [{layerMetadata: {title: "Layer 1"}}, {layerMetadata: {title: "Layer 2"}}];
        ReactDOM.render(<IdentifyContainer
            enabled
            index={0}
            requests={requests}
            responses={responses}
            getFeatureButtons={getFeatureButtons}
            point={{latlng: {lat: 1, lng: 1}}}
            showCoordinateEditor
        />, document.getElementById("container"));
        let coordinateEditorContainer = document.querySelectorAll('.coordinate-editor');
        expect(coordinateEditorContainer[0].style['z-index']).toBe('1');
    });
    it('onEdit handler', () => {
        const handlers = {
            onEdit: () => {}
        };
        const onEditSpy = expect.spyOn(handlers, 'onEdit');
        // TODO: refactor identifyContainer to avoid onEdit association with edit button
        // to be so messy
        const bt = {
            glyph: 'pencil',
            tooltipId: 'identify.edit',
            onClick: handlers.onEdit
        };
        const RESPONSE1 = {layer: {search: {url: 'search_url'}, fields: []}};
        act(() => {

            ReactDOM.render(<IdentifyContainer
                getToolButtons={({onEdit: f}) => [{...bt, onClick: () => f()}] }
                enabled
                index={0}
                showEdit
                isEditingAllowed
                requests={[{}]}
                responses={[RESPONSE1]}
                onEdit={handlers.onEdit}
            />, document.getElementById("container"));
        });
        const editButton = document.querySelector('.glyphicon-pencil');
        TestUtils.Simulate.click(editButton);
        expect(onEditSpy).toHaveBeenCalled();
        expect(onEditSpy.calls[0].arguments[0]).toEqual({
            ...RESPONSE1.layer,
            // the call of onEdit overrides the layer URL with the search URL
            url: RESPONSE1.layer.search.url
        });


    });
});
