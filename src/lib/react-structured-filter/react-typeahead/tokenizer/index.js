import React, { Component } from "react";
import propTypes from "prop-types";
import Token from "./token";
import KeyEvent from "../keyevent";
import Typeahead from "../typeahead";
import classNames from "classnames";

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
export default class TypeaheadTokenizer extends Component {
  static propTypes = {
    options: propTypes.array,
    customClasses: propTypes.object,
    defaultSelected: propTypes.oneOfType([propTypes.array, propTypes.func]),
    defaultValue: propTypes.string,
    placeholder: propTypes.string,
    onTokenRemove: propTypes.func,
    onTokenAdd: propTypes.func,
    onClearAll: propTypes.func,
    renderTokens: propTypes.func,
    fuzzySearchEmptyMessage: propTypes.string,
    fuzzySearchKeyAttribute: propTypes.string,
    isAllowSearchDropDownHeader: propTypes.bool,
    isAllowOperator: propTypes.bool,
    isAllowCustomValue: propTypes.bool,
    isAllowClearAll: propTypes.bool,
    disabled: propTypes.bool
  };

  static defaultProps = {
    options: [],
    defaultSelected: [],
    customClasses: {},
    defaultValue: "",
    placeholder: "",
    isAllowClearAll: true,
    disabled: false,
    fuzzySearchEmptyMessage: "No result found",
    onTokenAdd() {},
    onTokenRemove() {}
  };

  constructor(props) {
    super(props);
    this.typeaheadRef = null;
    this.skipCategorySet = new Set();
    this.state = {
      selected: [],
      conditional: "",
      category: "",
      operator: "",
      options: this.props.options,
      focused: this.props.autoFocus || false,
      ediTableTokenId: null,
      queryValueToEdit: null
    };
    this.state.selected = this.getDefaultSelectedValue();
    this.queryOptions = [];
    this.queryResultObj = {};
  }

  _renderTokens() {
    if (this.props.renderTokens) {
      return this.props.renderTokens(this.state.selected);
    }
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);

    var result = this.state.selected.map((selected, index) => {
      let fuzzySearchKeyAttribute = this._getFuzzySearchKeyAttribute({
        category: selected.category
      });
      let mykey =
        selected.category +
        (this.props.isAllowOperator ? selected.operator : "") +
        (selected.value ? (typeof selected.value == "string" ? selected.value : selected.value[fuzzySearchKeyAttribute]) : "") +
        index;

      return this.state.ediTableTokenId === index ? (
        this._getTypeahed({ mykey, show: true })
      ) : (
        <Token
          key={mykey}
          className={classList}
          renderTokenItem={this.props.renderTokenItem}
          fuzzySearchKeyAttribute={fuzzySearchKeyAttribute}
          fuzzySearchIdAttribute={this.props.fuzzySearchIdAttribute}
          onRemoveToken={this._removeTokenForValue}
          onEditToken={this._editTokenForValue.bind(this)}
          ediTableTokenId={this.state.ediTableTokenId}
          {...this.props}
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
      for (var i = 0; i < this.state.options.length; i++) {
        const _category = this._getCategoryName(this.state.options[i].category);
        categories.push(_category);
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

    return this.state.options;
  }

  _getCategoryName(category, displayTextFlag) {
    let _category = category;
    if (category.toString() === "[object Object]") {
      _category = displayTextFlag ? category.displayName || category.name : category.name;
    }
    return _category;
  }

  _getHeader() {
    if (this.state.category == "") {
      return "Category";
    } else if (this.state.operator == "") {
      return "Operator";
    } else {
      return "Value";
    }
  }

  _getCategoryType() {
    for (var i = 0; i < this.state.options.length; i++) {
      if (this._getCategoryName(this.state.options[i].category) == this.state.category) {
        return this.state.options[i].type;
      }
    }
  }

  _getCategoryOptions() {
    for (var i = 0; i < this.state.options.length; i++) {
      if (this._getCategoryName(this.state.options[i].category) == this.state.category) {
        return this.state.options[i].options;
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
    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      if (this.state.operator != "") {
        this.setState({ operator: "" });
      } else if (this.state.category != "") {
        this.setState({ category: "" });
      } else if (this.state.conditional != "") {
        this.setState({ conditional: "" });
      } else {
        // No tokens
        if (!this.state.selected.length) {
          if (this.props.emptyParentCategoryState) {
            this.props.emptyParentCategoryState();
          }
          return;
        }
        if (this.state.ediTableTokenId === null || this.state.ediTableTokenId === undefined) {
          this.state.queryValueToEdit = null;
        }
        this.state.ediTableTokenId === null && this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
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

  _editTokenForValue = value => {
    const index = this.state.selected.indexOf(value),
      type = this.state.options.find(o => this._getCategoryName(o.category) === value.category).type;
    let queryVal = null;
    if (type === "query") {
      queryVal = value.value.trim().substr(0, value.value.trim().length - 1);
    }
    this.setState(
      {
        conditional: value.conditional || "",
        category: value.category || "",
        operator: value.operator,
        value: null,
        ediTableTokenId: index,
        focused: true,
        queryValueToEdit: queryVal
      },
      () =>
        setTimeout(() => {
          this._focusInput();
        }, 0)
    );
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
    if (this.state.category != "" && (this.props.isAllowOperator ? this.state.operator != "" : true)) {
      return this._getCategoryType();
    } else {
      return "text";
    }
  }

  _getTypeahed() {
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
    var classes = {
      "filter-tokenizer": true
    };
    classes[this.props.customClasses.query] = this.props.customClasses.query;
    var classList = classNames(classes, {
      "padding-for-clear-all": this.props.isAllowClearAll,
      disabled: this.props.disabled
    });
    return (
      <div
        className={classList}
        ref={node => {
          this.node = node;
        }}
      >
        <div className="token-collection" onClick={this.onClickOfDivFocusInput}>
          {this._renderTokens()}
          {this.state.ediTableTokenId === null && (
            <div className="filter-input-group">
              <div className="filter-conditional">{this.state.conditional}</div>
              <div className="filter-category">{this.state.category}</div>
              <div className="filter-operator">{this.state.operator}</div>
              {this._getTypeahed({ show: false })}
            </div>
          )}
        </div>
        {this.props.isAllowClearAll ? this._getClearAllButton() : null}
      </div>
    );
  }
}