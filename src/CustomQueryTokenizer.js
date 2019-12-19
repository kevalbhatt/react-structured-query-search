import React, {Component, Fragment} from 'react';

import Tokenizer from "./OTokenizer";

export default class CustomQueryTokenizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected : this.getSelectedValueArray()
        };
        this.options = this.props.queryOptions || [];
        this.conditionalList = [",", "AND","OR"," )"];
    }

    getSelectedValueArray () {
        if (!this.props.defaultSelected) {
            return [];
        }
        const strArray = this.getTrimedSplitData(this.props.defaultSelected, ' ('), itemsList = [];
        let obj = {};
        const recursionFunc = (arr, sideEffect) => {
            arr.forEach((str, i) => {
                if (["AND","OR"].includes(str)) {
                    obj.conditional = str + ' (';
                }
                if (/[,]/.test(str)) {
                    return recursionFunc(this.getTrimedSplitData(str, ','), ',');
                }
                if (/[!=<>]/.test(str)) {
                    if (sideEffect && i > 0) {
                        obj.conditional = sideEffect;
                    }
                    const o = this.getTrimedSplitData(str, ' ');
                    obj.category = o[0];
                    obj.operator = o[1];
                    obj.value = o[2];
                    if (Object.keys(obj).length === 4 && o.length > 3) {
                        itemsList.push(obj);
                        obj = {};
                        return recursionFunc(o.slice(3));
                    }
                }
                if (/[)]/.test(str) && !/[a-zA-Z0-9]/.test(str)) {
                    obj.conditional = str;
                    obj.category = '';
                    obj.operator = '';
                    obj.value = '';
                }
                if (Object.keys(obj).length === 4) {
                    itemsList.push(obj);
                    obj = {};
                }
            });
        };
        recursionFunc(strArray);
        return itemsList;
    }

    getTrimedSplitData (str, expression) {
        return str.split(expression).filter((f) => f.trim() !== '')
    }

    getOperatorOptions () {
        return ["==", "!="];
    }

    getSymbolOptions () {
        return ["TFSC", "PIL", "VNET"];
    }

    getTokenItem (obj) {
        const val = obj.children;
        return `${val.conditional} ${val.category} ${val.operator} ${val.value}`;
    }

    trimText (val) {
        return val.trim() === "" ? val.trim() : val + " ";
    }

    updateParentInputText () {
        let str = '';
        this.state.selected.forEach((s) => {
            str += this.trimText(s.conditional);
            str += this.trimText(s.category);
            str += this.trimText(s.operator);
            str += this.trimText(s.value);
        });
        this.props.updatedInputText(str, this.state.selected);
    }

    updateParentToken = () => {
        this.props.updatedToken();
    }

    render() {
        var classList = {
            input: "filter-tokenizer-text-input",
            results: "filter-tokenizer-list__container",
            listItem: "filter-tokenizer-list__item",
            query: "custom-query"
        };
        return(
            <Fragment>
                <Tokenizer
					isAllowOperator={true}
					defaultSelected={this.state.selected}
					options={this.options}
					renderTokenItem={this.getTokenItem}
                    conditionalHeader={"Conditional"}
                    categoryHeader={'Selection'}
					// onTokenAdd={val => console.log(val, 'onTokenAdd')}
                                        customClasses={classList}
                    emptyParentCategoryState={this.props.emptyParentCategoryState}
                    updateParentInputText={this.updateParentInputText.bind(this)}
                    customQuery={true}
                    autoFocus={true}
                    isAllowClearAll={false}
                    ediTableTokenId={this.props.ediTableTokenId}
                    updateParentToken={this.updateParentToken}
                    conditionalList={this.conditionalList}
                />
            </Fragment>
        );
    }
};
