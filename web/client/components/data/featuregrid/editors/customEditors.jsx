import React from 'react';
import DropDownEditor from './DropDownEditor';
import NumberEditor from './NumberEditor';
import FormatEditor from './FormatEditor';
import CustomAutocompleteEditor from './CustomAutocompleteEditor';

/**
 * MapStore allows for adding custom editors to Attribute Table.
 * Each custom editor must be added to this object for the ability to use it in localConfig.
 * Each property of this object corresponds to a custom editor. The name of the property will be the name
 * of the custom editor that can be used to reference the editor in localConfig.
 * The value of the property is an object, properties of which correspond to the types of
 * attributes that the custom editor will handle. Custom editor entry should look like this:
 *
 * ```
 * "CustomEditor": {
 *   "string": (props) => <CustomEditorString {...props}/>,
 *   "number": (props) => <CustomEditorNumber {...props}/>
 * }
 * ```
 *
 * Each value is a function that takes properties and returns an appropriate JSX element
 * to be used as an editor for the particular data type.
 *
 * Currently custom editors available by default are:
 *
 * * {@link #components.data.featuregrid.editors.DropDownEditor | DropDownEditor} - editor that allows to choose a value from a pre-configured values list
 * * {@link #components.data.featuregrid.editors.NumberEditor | NumberEditor} - editor that supports numeric data, setting min/max bounds on a value
 * * {@link #components.data.featuregrid.editors.FormatEditor | FormatEditor} - editor that checks if data matches a particular regular expression
 * * {@link #components.data.featuregrid.editors.CustomAutocompleteEditor | CustomAutocompleteEditor} - editor that enables dynamic fetching of unique attribute values from a source layer to target layer's attribute.
 *
 * Each editor has a specific section in framework documentation with available properties.
 *
 * @name customEditors
 * @memberof components.data.featuregrid.editors
 * @type {Object}
 */
const Editors = {
    "DropDownEditor": {
        "string": (props) => <DropDownEditor dataType="string" {...props}/>
    },
    "NumberEditor": {
        "int": (props) => <NumberEditor dataType="int" {...props}/>,
        "number": (props) => <NumberEditor dataType="number" {...props}/>
    },
    "FormatEditor": {
        "string": (props) => <FormatEditor dataType="string" {...props}/>
    },
    "CustomAutocompleteEditor": {
        "string": (props) => <CustomAutocompleteEditor dataType="string" {...props}/>
    }
};


export default Editors;
