import React, { Component } from "react";
import propTypes from "prop-types";
import Token from "./token";
import KeyEvent from "../keyevent";
import Typeahead from "../typeahead";
import classNames from "classNames";

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
export default class TypeaheadTokenizer extends Component {
  static propTypes = {
    options: propTypes.array,
    customClasses: propTypes.object,
    defaultSelected: propTypes.array,
    defaultValue: propTypes.string,
    placeholder: propTypes.string,
    onTokenRemove: propTypes.func,
    onTokenAdd: propTypes.func,
    renderTokens: propTypes.func
  };

  static defaultProps = {
    options: [],
    defaultSelected: [],
    customClasses: {},
    defaultValue: "",
    placeholder: "",
    allowDuplicateOptions: false,
    allowDuplicateCategories: true,
    fuzzySearchEmptyMessage: "No result found",
    onTokenAdd() {},
    onTokenRemove() {}
  };

  constructor(props) {
    super(props);
    this.typeaheadRef = null;
    this.state = {
      selected: this.props.defaultSelected || [],
      category: "",
      operator: "",
      focused: false
    };
  }

  _renderTokens() {
    if (this.props.renderTokens) {
      return this.props.renderTokens(this.state.selected);
    }
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses
      .token;
    var classList = classNames(tokenClasses);

    var result = this.state.selected.map(selected => {
      let mykey =
        selected.category +
        (this.props.isAllowOperator ? selected.operator : "") +
        (typeof selected.value == "string"
          ? selected.value
          : selected.value[this.props.fuzzySearchKeyAttribute]);
      return (
        <Token
          key={mykey}
          className={classList}
          fuzzySearchKeyAttribute={this._getFuzzySearchKeyAttribute({
            category: selected.category
          })}
          fuzzySearchIdAttribute={this.props.fuzzySearchIdAttribute}
          onRemoveToken={this._removeTokenForValue}
        >
          {selected}
        </Token>
      );
    });
    return result;
  }

  _getOptionsForTypeahead() {
    if (this.state.category == "") {
      var categories = [];
      for (var i = 0; i < this.props.options.length; i++) {
        categories.push(this.props.options[i].category);
      }
      return categories;
    } else if (this.state.operator == "") {
      let categoryType = this._getCategoryType();

      if (categoryType == "text") {
        return ["==", "!=", "contains", "!contains"];
      } else if (categoryType == "textoptions") {
        return ["==", "!="];
      } else if (categoryType == "number" || categoryType == "date") {
        return ["==", "!=", "<", "<=", ">", ">="];
      } else {
        console.log("WARNING: Unknown category type in tokenizer");
      }
    } else {
      var options = this._getCategoryOptions();
      if (options == null) return [];
      else return options();
    }

    return this.props.options;
  }

  _getHeader() {
    if (this.state.category == "") {
      return "Category";
    } else if (this.state.operator == "") {
      return "Operator";
    } else {
      return "Value";
    }

    return this.props.options;
  }

  _getCategoryType() {
    for (var i = 0; i < this.props.options.length; i++) {
      if (this.props.options[i].category == this.state.category) {
        return this.props.options[i].type;
      }
    }
  }

  _getCategoryOptions() {
    for (var i = 0; i < this.props.options.length; i++) {
      if (this.props.options[i].category == this.state.category) {
        return this.props.options[i].options;
      }
    }
  }

  _onKeyDown = event => {
    // We only care about intercepting backspaces
    if (event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.typeaheadRef.getInputRef();
    if (
      entry.selectionStart == entry.selectionEnd &&
      entry.selectionStart == 0
    ) {
      if (this.state.operator != "") {
        this.setState({ operator: "" });
      } else if (this.state.category != "") {
        this.setState({ category: "" });
      } else {
        // No tokens
        if (!this.state.selected.length) {
          return;
        }
        this._removeTokenForValue(
          this.state.selected[this.state.selected.length - 1]
        );
      }
      event.preventDefault();
    }
  };

  _removeTokenForValue = value => {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onTokenRemove(this.state.selected);

    return;
  };

  _addTokenForValue = value => {
    if (this.state.category == "") {
      this.setState({ category: value });
      this.typeaheadRef.setEntryText("");
      return;
    }

    if (this.state.operator == "") {
      this.setState({ operator: value });
      this.typeaheadRef.setEntryText("");
      return;
    }

    value = {
      category: this.state.category,
      operator: this.state.operator,
      value: value
    };

    this.state.selected.push(value);
    this.setState({ selected: this.state.selected });
    this.typeaheadRef.setEntryText("");
    this.props.onTokenAdd(this.state.selected);

    this.setState({ category: "", operator: "" });

    return;
  };

  /***
   * Returns the data type the input should use ("date" or "text")
   */
  _getInputType() {
    if (this.state.category != "" && this.state.operator != "") {
      return this._getCategoryType();
    } else {
      return "text";
    }
  }

  onClickOfDivFocusInput = e => {
    e.stopPropagation();
    if (this.typeaheadRef) {
      var entry = this.typeaheadRef.getInputRef();
      if (entry) {
        entry.focus();
      }
    }
  };

  _getTypeahed({ classList }) {
    return (
      <Typeahead
        ref={ref => (this.typeaheadRef = ref)}
        className={classList}
        placeholder={this.props.placeholder}
        customClasses={this.props.customClasses}
        options={this._getOptionsForTypeahead()}
        header={this._getHeader()}
        datatype={this._getInputType()}
        defaultValue={this.props.defaultValue}
        onOptionSelected={this._addTokenForValue}
        onKeyDown={this._onKeyDown}
      />
    );
  }

  render() {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses
      .typeahead;
    var classList = classNames(classes);
    return (
      <div
        className="filter-tokenizer"
        ref={node => {
          this.node = node;
        }}
      >
        <div className="token-collection" onClick={this.onClickOfDivFocusInput}>
          {this._renderTokens()}
          <div className="filter-input-group">
            <div className="filter-category">{this.state.category} </div>
            <div className="filter-operator">{this.state.operator} </div>

            {this._getTypeahed({ classList })}
          </div>
        </div>
      </div>
    );
  }
}