/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import ReactDOM from 'react-dom';
import React from 'react';
import expect from 'expect';
import DropDownEditor from '../../../components/data/featuregrid/editors/DropDownEditor';

import {
    register,
    clean,
    get,
    set,
    getCustomEditor,
    remove
} from '../EditorRegistry';
const attribute = "STATE_NAME";
const url = "https://demo.geo-solutions.it/geoserver/wfs";
const typeName = "topp:states";
const rules = [{
    "regex": {
        "attribute": "STATE_NAME"
    },
    "editor": "DropDownEditor",
    "editorProps": {
        "values": ["Opt1", "Opt2"],
        "forceSelection": true
    }
}];
import Editor from '../../../components/data/featuregrid/editors/AttributeEditor';
import NumberEditor from '../../../components/data/featuregrid/editors/NumberEditor';
const testEditors = {
    "defaultEditor": (props) => <Editor {...props}/>,
    "string": (props) => <DropDownEditor dataType="string" {...props}/>,
    "int": (props) => <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...props}/>,
    "number": (props) => <NumberEditor dataType="number" inputProps={{step: 1, type: "number"}} {...props}/>
};
describe('EditorRegistry tests ', () => {
    let original;
    beforeEach(() => {
        original = get();
        document.body.innerHTML = '<div id="container"></div>';
        clean();
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        set(original);
    });
    it('check custom editors by default', () => {
        ["DropDownEditor", "NumberEditor", "FormatEditor"].map((v) => {
            expect(original[v]).toBeTruthy();
            expect(Object.keys(original[v].length > 0)).toBeTruthy();
        });
    });
    it('clean', () => {
        let Editors = get();
        clean();
        expect(Object.keys(Editors).length).toBe(0);
    });
    it('get', () => {
        let Editors = get();
        expect(Object.keys(Editors).length).toBe(0);
    });
    it('register using defaults', () => {
        const name = "custom_name_editor";
        register({name});
        let Editors = get();
        expect(Object.keys(Editors).length).toBe(0);
    });
    it('register using custom editors', () => {
        const name = "custom_name_editor2";
        const customEditors = Object.assign({}, testEditors);
        delete customEditors.string;
        register({name, editors: customEditors});
        let Editors = get();
        expect(Object.keys(Editors).length).toBe(1);
        expect(Editors[name]).toBe(customEditors);
        expect(Object.keys(Editors[name]).length).toBe(3);
    });
    it('remove with name NOT PRESENT in the list', () => {
        const name = "non present editor";
        const result = remove(name);
        expect(result).toBe(false);
    });
    it('remove with name PRESENT in the list', () => {
        const name = "custom_name_editor2";
        const customEditors = Object.assign({}, testEditors);
        register({name, editors: customEditors});

        const result = remove(name);
        expect(result).toBe(true);
    });
    it('getCustomEditor with positive match', () => {
        const name = "DropDownEditor";
        const customEditors = Object.assign({}, testEditors);
        register({name, editors: customEditors});
        const editor = getCustomEditor({attribute, url, typeName}, rules, {type: "string", props: {}});
        expect(editor).toExist();
    });
    it('getCustomEditor with positive match but not supported type, i.e. default editor', () => {
        const name = "DropDownEditor";
        const customEditors = Object.assign({}, testEditors);
        register({name, editors: customEditors});
        const editor = getCustomEditor({attribute, url, typeName}, rules, {type: "varchar", props: {}});
        expect(editor).toExist();
    });
    it('getCustomEditor with positive match but not supported type, return null', () => {
        const name = "DropDownEditor";
        let customEditors = Object.assign({}, testEditors);
        delete customEditors.defaultEditor;
        register({name, editors: customEditors});
        const editor = getCustomEditor({attribute, url, typeName}, rules, {type: "varchar", props: {}});
        expect(editor).toBe(null);
    });
    it('getCustomEditor with negative match', () => {
        const attr = "STAsTE_NAME";
        const name = "DropDownEditor";
        const customEditors = Object.assign({}, testEditors);
        register({name, editors: customEditors});
        const editor = getCustomEditor({attribute: attr, url, typeName}, rules, {type: "string", props: {}});
        expect(editor).toBe(null);
    });
    it('getCustomEditor with no rules', () => {
        const name = "DropDownEditor";
        const customEditors = Object.assign({}, testEditors);
        register({name, editors: customEditors});

        const rulesempty = [{}];
        const editor = getCustomEditor({attribute, url, typeName}, rulesempty, {type: "string", props: {}});
        expect(editor).toBe(null);
    });

    it('testing fetch of custom editors', () => {
        const name = "DropDownEditor";
        const customEditors = Object.assign({}, testEditors);
        register({name, editors: customEditors});

        const AutocompleteEditor = getCustomEditor({attribute, url, typeName}, rules, {type: "string", props: {autocompleteEnabled: true}});
        expect(AutocompleteEditor).toExist();

        const IntEditor = getCustomEditor({attribute, url, typeName}, rules, {type: "int", props: {}});
        expect(IntEditor).toExist();

        const NumbEditor = getCustomEditor({attribute, url, typeName}, rules, {type: "number", props: {}});
        expect(NumbEditor).toExist();

    });
});
