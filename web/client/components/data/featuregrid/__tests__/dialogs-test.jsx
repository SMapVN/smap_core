/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import { ConfirmClear, ConfirmDelete, ConfirmFeatureClose } from '../dialog';

describe('FeatureGrid confirm dialogs', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render ConfirmDelete', () => {
        ReactDOM.render(<ConfirmDelete/>, document.getElementById("container"));
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toExist();
    });
    it('render ConfirmFeatureClose', () => {
        ReactDOM.render(<ConfirmFeatureClose/>, document.getElementById("container"));
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toExist();
    });
    it('render ConfirmClear', () => {
        ReactDOM.render(<ConfirmClear/>, document.getElementById("container"));
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toExist();
    });

});
