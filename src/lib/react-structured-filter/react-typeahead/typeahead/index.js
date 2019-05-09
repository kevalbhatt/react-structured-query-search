import React, { Component } from "react";
import propTypes from "prop-types";
import moment from "moment";

import TypeaheadSelector from "./selector";
import KeyEvent from "../keyevent";
import fuzzy from "fuzzy";
import DatePicker from "../../react-datepicker/datepicker.js";
import classNames from "classNames";

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
export default class Typeahead extends Component {
  static propTypes = {
    customClasses: propTypes.object,
    maxVisible: propTypes.number,
    options: propTypes.oneOfType([propTypes.array, propTypes.object]),
    header: propTypes.string,
    datatype: propTypes.string,
    defaultValue: propTypes.string,
    placeholder: propTypes.string,
    onOptionSelected: propTypes.func,
    onKeyDown: propTypes.func
  };

  static defaultProps = {
    options: [],
    header: "Category",
    datatype: "text",
    customClasses: {},
    defaultValue: "",
    placeholder: "",
    onKeyDown: function(event) {
      return;
    },
    onOptionSelected: function(option) {}
  };

  constructor(props) {
    super(props);
    this.datepickerRef = React.createRef();
    this.entryRef = React.createRef();
    this.selRef = React.createRef();
    this.inputRef = React.createRef();
    this.state = {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      loadingOptions: false,
      options: this.props.options,
      header: this.props.header,
      datatype: this.props.datatype,

      // The currently visible set of options
      visible: this.getOptionsForValue(
        this.props.defaultValue,
        this.props.options
      ),

      // This should be called something else, "entryValue"
      entryValue: this.props.defaultValue,

      // A valid typeahead value
      selection: null
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      options: nextProps.options,
      header: nextProps.header,
      datatype: nextProps.datatype,
      visible: nextProps.options
    });
  }

  getOptionsForValue(value, options) {
    var result = fuzzy.filter(value, options).map(function(res) {
      return res.string;
    });

    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  }

  setEntryText(value) {
    if (this.entryRef != null) {
      this.entryRef.current.value = value;
    }
    this._onTextEntryUpdated();
  }

  _renderIncrementalSearchResults() {
    if (!this.props.isElemenFocused) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    // There are no typeahead / autocomplete suggestions
    if (!this.state.visible.length) {
      return "";
    }

    return (
      <TypeaheadSelector
        ref={this.selRef}
        options={this.state.visible}
        header={this.state.header}
        onOptionSelected={this._onOptionSelected.bind(this)}
        customClasses={this.props.customClasses}
      />
    );
  }

  _onOptionSelected(option) {
    var nEntry = this.entryRef.current;
    nEntry.focus();
    nEntry.value = option;
    this.setState({
      visible: this.getOptionsForValue(option, this.state.options),
      selection: option,
      entryValue: option
    });

    this.props.onOptionSelected(option);
  }

  _onTextEntryUpdated = () => {
    var value = "";
    if (this.entryRef != null) {
      value = this.entryRef.current.value;
    }
    this.setState({
      visible: this.getOptionsForValue(value, this.state.options),
      selection: null,
      entryValue: value
    });
  };

  _onEnter = event => {
    if (this.selRef && this.selRef.current) {
      if (!this.selRef.current.state.selection) {
        return this.props.onKeyDown(event);
      }

      this._onOptionSelected(this.selRef.current.state.selection);
    }
  };

  _onEscape = () => {
    this.selRef.current.setSelectionIndex(null);
  };

  _onTab = event => {
    var option = this.selRef.current.state.selection
      ? this.selRef.current.state.selection
      : this.state.visible[0];
    this._onOptionSelected(option);
  };

  eventMap(event) {
    var events = {};
    if (this.selRef && this.selRef.current) {
      events[KeyEvent.DOM_VK_UP] = this.selRef.current.navUp;
      events[KeyEvent.DOM_VK_DOWN] = this.selRef.current.navDown;
    }
    events[KeyEvent.DOM_VK_RETURN] = events[
      KeyEvent.DOM_VK_ENTER
    ] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  }

  _onKeyDown = event => {
    // If Enter pressed
    if (
      event.keyCode === KeyEvent.DOM_VK_RETURN ||
      event.keyCode === KeyEvent.DOM_VK_ENTER
    ) {
      // If no options were provided so we can match on anything
      if (this.props.options.length === 0) {
        this._onOptionSelected(this.state.entryValue);
      }

      // If what has been typed in is an exact match of one of the options
      if (this.props.options.indexOf(this.state.entryValue) > -1) {
        this._onOptionSelected(this.state.entryValue);
      }
    }

    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler
    if (!this.selRef) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  };

  _onFocus = event => {
    this.props.onElementFocused({ focused: true });
  };

  isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  _handleDateChange = date => {
    this.props.onOptionSelected(date.format("YYYY-MM-DD"));
  };

  _showDatePicker() {
    if (this.state.datatype == "date") {
      return true;
    }
    return false;
  }

  getInputRef() {
    if (this._showDatePicker()) {
      return this.datepickerRef.current.dateinputRef.current.entryRef.current;
    } else {
      return this.entryRef.current;
    }
  }

  _getTypeaheadInput({ classList, inputClassList }) {
    return (
      <span ref={this.inputRef} className={classList} onFocus={this._onFocus}>
        <input
          ref={this.entryRef}
          type="text"
          placeholder={this.props.placeholder}
          className={inputClassList}
          defaultValue={this.state.entryValue}
          onChange={this._onTextEntryUpdated}
          onKeyDown={this._onKeyDown}
        />
        {this._renderIncrementalSearchResults()}
      </span>
    );
  }

  render() {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses
      .input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: true
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    if (this._showDatePicker()) {
      return (
        <span ref={this.inputRef} className={classList} onFocus={this._onFocus}>
          <DatePicker
            isAllowOperator={this.props.isAllowOperator}
            ref={this.datepickerRef}
            dateFormat={"YYYY-MM-DD"}
            selected={moment()}
            onChange={this._handleDateChange}
            onKeyDown={this._onKeyDown}
          />
        </span>
      );
    }
    return this._getTypeaheadInput({ classList, inputClassList });
  }
}