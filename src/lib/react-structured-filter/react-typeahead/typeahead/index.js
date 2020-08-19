import React, { Component } from "react";
import propTypes from "prop-types";
import moment from "moment";

import TypeaheadSelector from "./selector";
import KeyEvent from "../keyevent";
import fuzzy from "fuzzy";
import DatePicker from "../../react-datepicker/datepicker.js";
import classNames from "classnames";

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
    isAllowSearchDropDownHeader: propTypes.bool,
    fuzzySearchEmptyMessage: propTypes.string,
    fuzzySearchKeyAttribute: propTypes.string,
    fuzzySearchIdAttribute: propTypes.string,
    datatype: propTypes.string,
    disabled: propTypes.bool,
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
    isAllowSearchDropDownHeader: true,
    fuzzySearchEmptyMessage: "No result found",
    fuzzySearchKeyAttribute: "name",
    fuzzySearchIdAttribute: "id",
    onKeyDown: function(event) {
      return;
    },
    onOptionSelected: function(option) {}
  };

  constructor(props) {
    super(props);
    this.datepickerRef = null;
    this.entryRef = null;
    this.selRef = null;
    this.inputRef = null;
    this.fuzzySearchKeyAttribute = this.props.fuzzySearchKeyAttribute;
    this.state = {
      // The set of all options... Does this need to be state?  I guess for lazy load...
      loadingOptions: false,
      options: this.props.options,
      header: this.props.header,
      datatype: this.props.datatype,

      // The currently visible set of options
      visible: this.getOptionsForValue(null, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.defaultValue,

      // A valid typeahead value
      selection: null,
      focused: this.props.isElemenFocused || false
    };
  }

  componentDidMount() {
    if (this.props.isElemenFocused && this.entryRef && this.entryRef.focus) {
      this.entryRef.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.fuzzySearchKeyAttribute = nextProps.fuzzySearchKeyAttribute || this.props.fuzzySearchKeyAttribute;
    this.setState({
      options: nextProps.options,
      header: nextProps.header,
      datatype: nextProps.datatype,
      visible: nextProps.options
    });
  }

  getOptionsForValue(value = this.props.defaultValue, options) {
    if (value == null) {
      value = this.props.defaultValue;
    }
    let extract = null;
    if (options && options.length && typeof options[0] == "object") {
      extract = {
        pre: "<",
        post: ">",
        extract: obj => {
          let val = obj[this.fuzzySearchKeyAttribute];
          if (!val) {
            throw "fuzzySearchKeyAttribute is missing inside options(values) list";
          }
          return val;
        }
      };
    }
    var result = fuzzy.filter(value, options, extract).map(function(res) {
      return res.original;
    });

    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }

    if (this.props.datatype == "textoptions" && !this.props.isAllowCustomValue) {
      return result.length == 0 ? [this.props.fuzzySearchEmptyMessage] : result;
    } else {
      return result;
    }
  }

  setEntryText = value => {
    if (this.entryRef != null) {
      this.entryRef.value = value;
    }
    this._onTextEntryUpdated();
  };

  _renderIncrementalSearchResults() {
    if (this.props.isElemenFocused == undefined) {
      if (!this.state.focused) {
        return "";
      }
    } else {
      if (!this.props.isElemenFocused) {
        return "";
      }
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
        ref={ref => (this.selRef = ref)}
        fromTokenizer={this.props.fromTokenizer}
        options={this.state.visible}
        header={this.state.header}
        isAllowSearchDropDownHeader={this.props.isAllowSearchDropDownHeader}
        fuzzySearchKeyAttribute={this.fuzzySearchKeyAttribute}
        fuzzySearchIdAttribute={this.props.fuzzySearchIdAttribute}
        fuzzySearchEmptyMessage={this.props.fuzzySearchEmptyMessage}
        renderSearchItem={this.props.renderSearchItem}
        onOptionSelected={this._onOptionSelected.bind(this)}
        customClasses={this.props.customClasses}
      />
    );
  }

  _onOptionSelected(option) {
    var nEntry = this.entryRef;
    nEntry.focus();
    nEntry.value = option;
    this.setState({
      visible: this.getOptionsForValue(option, this.state.options),
      selection: option,
      entryValue: option
    });
    this.props.onOptionSelected(option);
  }

  _onTextEntryUpdated = (val, queryResult) => {
    var value = "";
    if (this.entryRef != null) {
      value = this.entryRef.value;
    }
    if (this.state.datatype === "query") {
      value = val;
    }
    this.setState(
      {
        visible: this.getOptionsForValue(value, this.state.options),
        selection: null,
        entryValue: value
      },
      () => {
        if (this.state.datatype === "query" && val !== undefined) {
          this.props.onOptionSelected(value, queryResult, this.entryRef);
        }
      }
    );
  };

  _onEnter = event => {
    if (this.selRef && this.selRef) {
      if (!this.selRef.state.selection) {
        return this.props.onKeyDown(event);
      }

      this._onOptionSelected(this.selRef.state.selection);
    }
  };

  _onEscape = () => {
    this.selRef.setSelectionIndex(null);
  };

  _onTab = event => {
    var option = this.selRef.state.selection ? this.selRef.state.selection : this.state.visible[0];
    this._onOptionSelected(option);
  };

  eventMap(event) {
    var events = {};
    if (this.selRef && this.selRef) {
      events[KeyEvent.DOM_VK_UP] = this.selRef.navUp;
      events[KeyEvent.DOM_VK_DOWN] = this.selRef.navDown;
    }
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  }

  _onKeyDown = event => {
    // If Enter pressed
    if (event.keyCode === KeyEvent.DOM_VK_RETURN || event.keyCode === KeyEvent.DOM_VK_ENTER) {
      // If no options were provided so we can match on anything
      if (this.props.options.length === 0) {
        this._onOptionSelected(this.state.entryValue);
      } else if (
        this.props.options.indexOf(this.state.entryValue) > -1 ||
        (this.state.entryValue && this.state.entryValue.trim() != "" && this.props.isAllowCustomValue)
      ) {
        // If what has been typed in is an exact match of one of the options
        this._onOptionSelected(this.state.entryValue);
      } else if (this.props.customQuery) {
        var bracket = this.props.bracketHasClosed();
        if (bracket.openCount === bracket.closeCount && bracket.openCount > 0) {
          this.props.updateParentInputText();
        }
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
    if (this.props.onElementFocused) {
      this.props.onElementFocused({ focused: true });
    }
    this.setState({ focused: true });
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
      return this.datepickerRef.dateinputRef.entryRef;
    } else {
      return this.entryRef;
    }
  }

  _getTypeaheadInput({ classList, inputClassList }) {
    return (
      <span ref={ref => (this.inputRef = ref)} className={classList} onFocus={this._onFocus}>
        <input
          ref={ref => (this.entryRef = ref)}
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
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: true
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    if (this._showDatePicker()) {
      return (
        <span ref={ref => (this.inputRef = ref)} className={classList} onFocus={this._onFocus}>
          <DatePicker
            isAllowOperator={this.props.isAllowOperator}
            ref={ref => (this.datepickerRef = ref)}
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