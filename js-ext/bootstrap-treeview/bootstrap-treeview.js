/* =========================================================
 * bootstrap-treeview.js v1.2.0
 * =========================================================
 * Copyright 2013 Jonathan Miles
 * Project URL : http://www.jondmiles.com/bootstrap-treeview
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

;(function ($, window, document, undefined) {

    /*global jQuery, console*/

    'use strict';

    var pluginName = 'treeview';

    var _default = {};

    _default.settings = {

        injectStyle: true,

        levels: 2,

        expandIcon: 'glyphicon glyphicon-plus',
        collapseIcon: 'glyphicon glyphicon-minus',
        emptyIcon: 'glyphicon',
        loadableIcon: 'expand-icon glyphicon glyphicon-plus bootstrap-tree-loadable',
        loadingIcon: 'glyphicon glyphicon-option-horizontal',
        nodeIcon: '',
        selectedIcon: '',
        checkedIcon: 'glyphicon glyphicon-check',
        uncheckedIcon: 'glyphicon glyphicon-unchecked',

        color: undefined, // '#000000',
        backColor: undefined, // '#FFFFFF',
        borderColor: undefined, // '#dddddd',
        onhoverColor: '#F5F5F5',
        selectedColor: '#FFFFFF',
        selectedBackColor: '#428bca',
        searchResultColor: '#D9534F',
        searchResultBackColor: undefined, //'#FFFFFF',

        enableLinks: false,
        highlightSelected: true,
        highlightSearchResults: true,
        showBorder: true,
        showIcon: true,
        showCheckbox: false,
        showTags: false,
        multiSelect: false,
        dynamicLoading: false,

        // Event handlers
        onNodeChecked: undefined,
        onNodeCollapsed: undefined,
        onNodeDisabled: undefined,
        onNodeEnabled: undefined,
        onNodeExpanded: undefined,
        onNodeSelected: undefined,
        onNodeUnchecked: undefined,
        onNodeUnselected: undefined,
        onSearchComplete: undefined,
        onSearchCleared: undefined,
        onNodeLoading: undefined,
        onNodeDelete: undefined,
        onRedraw: undefined,
        onDragStart: undefined
    };

    _default.options = {
        silent: false,
        ignoreChildren: false
    };

    _default.searchOptions = {
        ignoreCase: true,
        exactMatch: false,
        revealResults: true
    };

    var Tree = function (element, options) {

        this.$element = $(element);
        this.elementId = element.id;
        this.styleId = this.elementId + '-style';
        this.idGenerator = (function() {
            var closure_id = 0;
            return (function() {
                return closure_id++;
            });
        })();

        this.init(options);

        return {

            // Options (public access)
            options: this.options,

            // Initialize / destroy methods
            init: $.proxy(this.init, this),
            remove: $.proxy(this.remove, this),
            clear: $.proxy(this.clear, this),

            // Get methods
            getNode: $.proxy(this.getNode, this),
            getNodes: $.proxy(this.getNodes, this),
            getParent: $.proxy(this.getParent, this),
            getSiblings: $.proxy(this.getSiblings, this),
            getSelected: $.proxy(this.getSelected, this),
            getUnselected: $.proxy(this.getUnselected, this),
            getExpanded: $.proxy(this.getExpanded, this),
            getCollapsed: $.proxy(this.getCollapsed, this),
            getChecked: $.proxy(this.getChecked, this),
            getUnchecked: $.proxy(this.getUnchecked, this),
            getDisabled: $.proxy(this.getDisabled, this),
            getEnabled: $.proxy(this.getEnabled, this),

            // Select methods
            selectNode: $.proxy(this.selectNode, this),
            unselectNode: $.proxy(this.unselectNode, this),
            toggleNodeSelected: $.proxy(this.toggleNodeSelected, this),

            // Expand / collapse methods
            collapseAll: $.proxy(this.collapseAll, this),
            collapseNode: $.proxy(this.collapseNode, this),
            expandAll: $.proxy(this.expandAll, this),
            expandNode: $.proxy(this.expandNode, this),
            toggleNodeExpanded: $.proxy(this.toggleNodeExpanded, this),
            revealNode: $.proxy(this.revealNode, this),

            // Expand / collapse methods
            checkAll: $.proxy(this.checkAll, this),
            checkNode: $.proxy(this.checkNode, this),
            uncheckAll: $.proxy(this.uncheckAll, this),
            uncheckNode: $.proxy(this.uncheckNode, this),
            toggleNodeChecked: $.proxy(this.toggleNodeChecked, this),

            // Disable / enable methods
            disableAll: $.proxy(this.disableAll, this),
            disableNode: $.proxy(this.disableNode, this),
            enableAll: $.proxy(this.enableAll, this),
            enableNode: $.proxy(this.enableNode, this),
            toggleNodeDisabled: $.proxy(this.toggleNodeDisabled, this),

            // Search methods
            search: $.proxy(this.search, this),
            clearSearch: $.proxy(this.clearSearch, this),

            // Dynamic Loading functions
            getNodesLoading: $.proxy(this.getNodesLoading, this),
            setNodeLoaded: $.proxy(this.setNodeLoaded, this),

            // Dynamic tree modification
            redraw: $.proxy(this.render, this),
            addNodes: $.proxy(this.addNodes, this),
            deleteNodes: $.proxy(this.deleteNodes, this)
        };
    };

    Tree.prototype.init = function (options) {

        this.tree = [];
        this.nodes = new Map();

        if (options.data) {
            if (typeof options.data === 'string') {
                options.data = $.parseJSON(options.data);
            }
            this.tree = $.extend(true, [], options.data);
            delete options.data;
        }
        this.options = $.extend({}, _default.settings, options);

        this.destroy();
        this.subscribeEvents();
        this.setInitialStates({ nodes: this.tree }, 0);
        this.render();
    };

    Tree.prototype.clear = function () {
        this.tree = [];
        this.nodes = new Map();
        this.render();
    };

    Tree.prototype.remove = function () {
        this.destroy();
        $.removeData(this, pluginName);
        $('#' + this.styleId).remove();
    };

    Tree.prototype.destroy = function () {

        if (!this.initialized) return;

        this.$wrapper.remove();
        this.$wrapper = null;

        // Switch off events
        this.unsubscribeEvents();

        // Reset this.initialized flag
        this.initialized = false;
    };

    Tree.prototype.unsubscribeEvents = function () {

        this.$element.off('click');
        this.$element.off('nodeChecked');
        this.$element.off('nodeCollapsed');
        this.$element.off('nodeDisabled');
        this.$element.off('nodeEnabled');
        this.$element.off('nodeExpanded');
        this.$element.off('nodeSelected');
        this.$element.off('nodeUnchecked');
        this.$element.off('nodeUnselected');
        this.$element.off('searchComplete');
        this.$element.off('searchCleared');
        this.$element.off('nodeLoading');
        this.$element.off('dragstart');
    };

    Tree.prototype.subscribeEvents = function () {

        this.unsubscribeEvents();

        this.$element.on('click', $.proxy(this.clickHandler, this));
        this.$element.on('dragstart', $.proxy(this.dragStartHandler, this));
        this.$element.on('nodeLoading', $.proxy(this.dragStartHandler, this));

        if (typeof (this.options.onNodeChecked) === 'function') {
            this.$element.on('nodeChecked', this.options.onNodeChecked);
        }

        if (typeof (this.options.onNodeCollapsed) === 'function') {
            this.$element.on('nodeCollapsed', this.options.onNodeCollapsed);
        }

        if (typeof (this.options.onNodeDisabled) === 'function') {
            this.$element.on('nodeDisabled', this.options.onNodeDisabled);
        }

        if (typeof (this.options.onNodeEnabled) === 'function') {
            this.$element.on('nodeEnabled', this.options.onNodeEnabled);
        }

        if (typeof (this.options.onNodeExpanded) === 'function') {
            this.$element.on('nodeExpanded', this.options.onNodeExpanded);
        }

        if (typeof (this.options.onNodeSelected) === 'function') {
            this.$element.on('nodeSelected', this.options.onNodeSelected);
        }

        if (typeof (this.options.onNodeUnchecked) === 'function') {
            this.$element.on('nodeUnchecked', this.options.onNodeUnchecked);
        }

        if (typeof (this.options.onNodeUnselected) === 'function') {
            this.$element.on('nodeUnselected', this.options.onNodeUnselected);
        }

        if (typeof (this.options.onSearchComplete) === 'function') {
            this.$element.on('searchComplete', this.options.onSearchComplete);
        }

        if (typeof (this.options.onSearchCleared) === 'function') {
            this.$element.on('searchCleared', this.options.onSearchCleared);
        }

        if (typeof (this.options.onNodeLoading) === 'function') {
            this.$element.on('nodeLoading', this.options.onNodeLoading);
        }

        if (typeof (this.options.onRedraw) === 'function') {
            this.$element.on('onRedraw', this.options.onRedraw);
        }

        if (typeof (this.options.onDragStart) === 'function') {
            this.$element.on('onDragStart', this.options.onDragStart);
        }
    };





    /*
     Set a valid initial states for a single passed node.
     User defined states will be preserved.
     */
    Tree.prototype.singleNodeInitialState = function (node, level) {

        // if not provided set selectable default value
        if (!node.hasOwnProperty('selectable')) {
            node.selectable = true;
        }

        // where provided we should preserve states
        node.state = node.state || {};

        // set dynamic loading state; unless set always false
        if (!node.state.hasOwnProperty('loaded')) {
            if (this.options.dynamicLoading && !node.nodes ) {
                node.state.loaded = false;
            }
            else {
                node.state.loaded = true;
            }
        }

        // set checked state; unless set always false
        if (!node.state.hasOwnProperty('checked')) {
            node.state.checked = false;
        }

        // set enabled state; unless set always false
        if (!node.state.hasOwnProperty('disabled')) {
            node.state.disabled = false;
        }

        // set expanded state; if not provided based on levels
        if (!node.state.hasOwnProperty('expanded')) {
            if (!node.state.disabled &&
                ((typeof level !== 'undefined') &&
                (level < this.options.levels)) &&
                (node.nodes && node.nodes.length > 0)) {
                node.state.expanded = true;
            }
            else {
                node.state.expanded = false;
            }
        }

        // set selected state; unless set always false
        if (!node.state.hasOwnProperty('selected')) {
            node.state.selected = false;
        }

        if (this.options.dynamicLoading) {
            node.state.requested = false;
        }

        // save reference to parent treeview instance
        node.refTreeview = this;

        return node;
    };

    /*
     Recurse the tree structure and ensure all nodes have
     valid initial states.  User defined states will be preserved.
     For performance we also take this opportunity to
     index nodes in a flattened structure
     */
    Tree.prototype.setInitialStates = function (node, level) {

        if (!node.nodes) return;
        level += 1;

        var parent = node;
        var _this = this;
        $.each(node.nodes, function checkStates(index, node) {

            // nodeId : unique, incremental identifier
            node.nodeId = _this.idGenerator();

            // parentId : transversing up the tree
            node.parentId = parent.nodeId;

            // save the tree depth position onto the node
            node.depth = level;

            // setup valid initial state
            node = _this.singleNodeInitialState.call(_this, node, level);

            // save reference to parent treeview instance
            node.refTreeview = _this;

            // index nodes in a flattened structure for use later
            _this.nodes.set(node.nodeId, node);

            // recurse child nodes and transverse the tree
            if (node.nodes) {
                _this.setInitialStates(node, level);
            }
        });
    };

    Tree.prototype.clickHandler = function (event) {

        if (!this.options.enableLinks) event.preventDefault();

        var target = $(event.target);
        var node = this.findNode(target);
        if (!node || node.state.disabled) return;

        var classList = target.attr('class') ? target.attr('class').split(' ') : [];
        if ((classList.indexOf('check-icon') !== -1)) {
            this.toggleCheckedState(node, _default.options);
            this.render();
        }
        else {
            this.toggleExpandedState(node, _default.options);
            this.render();
        }
    };

    // attach the data from the node to the drag and drop DataTransfer object
    Tree.prototype.dragStartHandler = function (event) {
        var node = this.findNode($(event.target));
        if (node === undefined) return;
        this.$element.trigger('onDrag', {'event':event, 'data': $.extend(true, {}, node)});
    };


    // Looks up the DOM for the closest parent list item to retrieve the
    // data attribute nodeid, which is used to lookup the node in the flattened structure.
    Tree.prototype.findNode = function (target) {

        var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
        var node = this.nodes.get(parseInt(nodeId));

        return node;
    };

    Tree.prototype.toggleExpandedState = function (node, options) {
        if (!node) return;
        this.setExpandedState(node, !node.state.expanded, options);
    };

    Tree.prototype.setExpandedState = function (node, state, options) {

        if (state === node.state.expanded) return;

        if (state) {
            if (this.options.dynamicLoading && !node.state.loaded) {
                if (!node.state.requested) {
                    // fire a dynamic load request
                    node.state.requested = true;
                    node.state.expanded = true;
                    this.$element.trigger('nodeLoading', $.extend(true, {}, node));
                }
            }

            if ($.isArray(node.nodes) && node.nodes.length > 0) {
                // Expand a node
                node.state.expanded = true;
                if (!options.silent) {
                    this.$element.trigger('nodeExpanded', $.extend(true, {}, node));
                }
            }

        } else if (!state) {

            // Collapse a node
            node.state.expanded = false;
            if (!options.silent) {
                this.$element.trigger('nodeCollapsed', $.extend(true, {}, node));
            }

            // Collapse child nodes
            if (node.nodes && !options.ignoreChildren) {
                $.each(node.nodes, $.proxy(function (index, node) {
                    this.setExpandedState(node, false, options);
                }, this));
            }
        }
    };

    Tree.prototype.toggleSelectedState = function (node, options) {
        if (!node) return;
        this.setSelectedState(node, !node.state.selected, options);
    };

    Tree.prototype.setSelectedState = function (node, state, options) {

        if (state === node.state.selected) return;

        if (state) {

            // If multiSelect false, unselect previously selected
            if (!this.options.multiSelect) {
                $.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(function (index, node) {
                    this.setSelectedState(node, false, options);
                }, this));
            }

            // Continue selecting node
            node.state.selected = true;
            if (!options.silent) {
                this.$element.trigger('nodeSelected', $.extend(true, {}, node));
            }
        }
        else {

            // Unselect node
            node.state.selected = false;
            if (!options.silent) {
                this.$element.trigger('nodeUnselected', $.extend(true, {}, node));
            }
        }
    };

    Tree.prototype.toggleCheckedState = function (node, options) {
        if (!node) return;
        this.setCheckedState(node, !node.state.checked, options);
    };

    Tree.prototype.setCheckedState = function (node, state, options) {

        if (state === node.state.checked) return;

        if (state) {

            // Check node
            node.state.checked = true;

            if (!options.silent) {
                this.$element.trigger('nodeChecked', $.extend(true, {}, node));
            }
        }
        else {

            // Uncheck node
            node.state.checked = false;
            if (!options.silent) {
                this.$element.trigger('nodeUnchecked', $.extend(true, {}, node));
            }
        }
    };

    Tree.prototype.setDisabledState = function (node, state, options) {

        if (state === node.state.disabled) return;

        if (state) {

            // Disable node
            node.state.disabled = true;

            // Disable all other states
            this.setExpandedState(node, false, options);
            this.setSelectedState(node, false, options);
            this.setCheckedState(node, false, options);

            if (!options.silent) {
                this.$element.trigger('nodeDisabled', $.extend(true, {}, node));
            }
        }
        else {

            // Enabled node
            node.state.disabled = false;
            if (!options.silent) {
                this.$element.trigger('nodeEnabled', $.extend(true, {}, node));
            }
        }
    };

    Tree.prototype.render = function () {

        if (!this.initialized) {

            // Setup first time only components
            this.$element.addClass(pluginName);
            this.$wrapper = $(this.template.list);

            this.injectStyle();

            this.initialized = true;
        }

        this.$element.empty().append(this.$wrapper.empty());

        // Build tree
        this.buildTree(this.tree, 0);
        // fire onRedraw event
        this.$element.trigger('onRedraw');

    };

    // Starting from the root node, and recursing down the
    // structure we build the tree one node at a time
    Tree.prototype.buildTree = function (nodes, level) {

        if (!nodes) return;
        level += 1;

        var _this = this;

        $.each(nodes, function addNodes(id, node) {

            var treeItem = $(_this.template.item)
                .addClass('node-' + _this.elementId)
                .addClass(node.state.checked ? 'node-checked' : '')
                .addClass(node.state.disabled ? 'node-disabled': '')
                .addClass(node.state.selected ? 'node-selected' : '')
                .addClass(node.searchResult ? 'search-result' : '')
                .attr('data-nodeid', node.nodeId)
                .attr('style', _this.buildStyleOverride(node));

            node.el_Node = treeItem;

            // add a title attribute (for tooltip) if node has it specified
            if (node.title !== undefined) treeItem.attr('title', node.title);

            // Add indent/spacer to mimic tree structure
            treeItem.addClass("indent-"+(level - 1));


            // Add expand, collapse, loading or empty spacer icons
            var classList = [];
            if (node.nodes && node.nodes.length > 0) {
                classList.push('expand-icon');
                if (node.state.expanded) {
                    classList.push(_this.options.collapseIcon);
                } else {
                    classList.push(_this.options.expandIcon);
                }
            } else {
                if (_this.options.dynamicLoading && !node.state.loaded) {
                    if (!node.state.requested) {
                        // node may have children but requires expansion to determine
                        classList.push(_this.options.loadableIcon);
                    } else {
                        // node is in the process of loading
                        classList.push(_this.options.loadingIcon);
                    }
                } else {
                    classList.push(_this.options.emptyIcon);
                }
            }

            treeItem
                .append($(_this.template.icon)
                    .addClass(classList.join(' '))
                );


            // Add node icon
            if (_this.options.showIcon) {

                var classList = ['node-icon'];

                classList.push(node.icon || _this.options.nodeIcon);
                if (node.state.selected) {
                    classList.pop();
                    classList.push(node.selectedIcon || _this.options.selectedIcon ||
                        node.icon || _this.options.nodeIcon);
                }

                if (node.depth === undefined) node.depth = level;
                classList.push('tv-depth-'+node.depth);

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }

            // Add check / unchecked icon
            if (_this.options.showCheckbox) {

                var classList = ['check-icon'];
                if (node.state.checked) {
                    classList.push(_this.options.checkedIcon);
                }
                else {
                    classList.push(_this.options.uncheckedIcon);
                }

                treeItem
                    .append($(_this.template.icon)
                        .addClass(classList.join(' '))
                    );
            }

            // Add text
            if (_this.options.enableLinks) {
                // Add hyperlink
                treeItem
                    .append($(_this.template.link)
                        .attr('href', node.href)
                        .append(node.text)
                    );
            }
            else {
                // otherwise just text
                treeItem
                    .append(node.text);
            }

            // Add tags as badges
            if (_this.options.showTags && node.tags) {
                $.each(node.tags, function addTag(id, tag) {
                    treeItem
                        .append($(_this.template.badge)
                            .append(tag)
                        );
                });
            }

            // Add item to the tree
            _this.$wrapper.append(treeItem);

            // Recursively add child ndoes
            if (node.nodes && node.state.expanded && !node.state.disabled) {
                return _this.buildTree(node.nodes, level);
            }
        });
    };

    // Define any node level style override for
    // 1. selectedNode
    // 2. node|data assigned color overrides
    Tree.prototype.buildStyleOverride = function (node) {

        if (node.state.disabled) return '';

        var color = node.color;
        var backColor = node.backColor;

        if (this.options.highlightSelected && node.state.selected) {
            if (this.options.selectedColor) {
                color = this.options.selectedColor;
            }
            if (this.options.selectedBackColor) {
                backColor = this.options.selectedBackColor;
            }
        }

        if (this.options.highlightSearchResults && node.searchResult && !node.state.disabled) {
            if (this.options.searchResultColor) {
                color = this.options.searchResultColor;
            }
            if (this.options.searchResultBackColor) {
                backColor = this.options.searchResultBackColor;
            }
        }

        var ret = '';
        if (color) { ret += 'color:' + color + ';'; }
        if (backColor) { ret += 'background-color:' + backColor + ';'; }
        return ret;
    };

    // Add inline style into head
    Tree.prototype.injectStyle = function () {

        if (this.options.injectStyle && !document.getElementById(this.styleId)) {
            $('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
        }
    };

    // Construct trees style based on user options
    Tree.prototype.buildStyle = function () {

        var style = '.node-' + this.elementId + '{';

        if (this.options.color) {
            style += 'color:' + this.options.color + ';';
        }

        if (this.options.backColor) {
            style += 'background-color:' + this.options.backColor + ';';
        }

        if (!this.options.showBorder) {
            style += 'border:none;';
        }
        else if (this.options.borderColor) {
            style += 'border:1px solid ' + this.options.borderColor + ';';
        }
        style += '}';

        if (this.options.onhoverColor) {
            style += '.node-' + this.elementId + ':not(.node-disabled):hover{' +
                'background-color:' + this.options.onhoverColor + ';' +
                '}';
        }

        return this.css + style;
    };

    Tree.prototype.template = {
        list: '<ul class="list-group"></ul>',
        item: '<li class="list-group-item"></li>',
        icon: '<span class="icon"></span>',
        link: '<a href="#" style="color:inherit;"></a>',
        badge: '<span class="badge"></span>'
    };

    Tree.prototype.css = '.treeview .list-group-item{cursor:pointer}.treeview span.icon{width:12px;margin-right:5px}.treeview .node-disabled{color:silver;cursor:not-allowed}'


    /**
     Returns a single node object that matches the given node id.
     @param {Number} nodeId - A node's unique identifier
     @return {Object} node - Matching node
     */
    Tree.prototype.getNode = function (nodeId) {
        return this.nodes.get(parseInt(nodeId));
    };

    /**
     Returns an array of node object that pass the given filter function (by returning true)
     @param {Function} filter - function(nodeReference[, passed arguments])
     @return {Array} nodes - Array containing matching nodes
     */
    Tree.prototype.getNodes = function (filterFunc) {
        var _this = this;
        var ret = [];
        var args = [];
        for (var i in arguments) { args.push(arguments[i]); }
        return Array.from(this.nodes.values()).filter(function(obj) {
            try {
                args[0] = obj;
                return filterFunc.apply(_this, args);
            } catch(e) {
                return false;
            }
        });
    };


    /**
     Returns the parent node of a given node, if valid otherwise returns undefined.
     @param {Object|Number} identifier - A valid node or node id
     @returns {Object} node - The parent node
     */
    Tree.prototype.getParent = function (identifier) {
        var node = this.identifyNode(identifier);
        return Array.from(this.nodes.values()).find(function(n) { return n.nodeId === node.parentId; });
//        return this.nodes[node.parentId];
    };

    /**
     Returns an array of sibling nodes for a given node, if valid otherwise returns undefined.
     @param {Object|Number} identifier - A valid node or node id
     @returns {Array} nodes - Sibling nodes
     */
    Tree.prototype.getSiblings = function (identifier) {
        var node = this.identifyNode(identifier);
        var parent = this.getParent(node);
        var nodes = parent ? parent.nodes : this.tree;
        return nodes.filter(function (obj) {
            return obj.nodeId !== node.nodeId;
        });
    };

    /**
     Returns an array of selected nodes.
     @returns {Array} nodes - Selected nodes
     */
    Tree.prototype.getSelected = function () {
        return this.findNodes('true', 'g', 'state.selected');
    };

    /**
     Returns an array of unselected nodes.
     @returns {Array} nodes - Unselected nodes
     */
    Tree.prototype.getUnselected = function () {
        return this.findNodes('false', 'g', 'state.selected');
    };

    /**
     Returns an array of expanded nodes.
     @returns {Array} nodes - Expanded nodes
     */
    Tree.prototype.getExpanded = function () {
        return this.findNodes('true', 'g', 'state.expanded');
    };

    /**
     Returns an array of collapsed nodes.
     @returns {Array} nodes - Collapsed nodes
     */
    Tree.prototype.getCollapsed = function () {
        return this.findNodes('false', 'g', 'state.expanded');
    };

    /**
     Returns an array of checked nodes.
     @returns {Array} nodes - Checked nodes
     */
    Tree.prototype.getChecked = function () {
        return this.findNodes('true', 'g', 'state.checked');
    };

    /**
     Returns an array of unchecked nodes.
     @returns {Array} nodes - Unchecked nodes
     */
    Tree.prototype.getUnchecked = function () {
        return this.findNodes('false', 'g', 'state.checked');
    };

    /**
     Returns an array of disabled nodes.
     @returns {Array} nodes - Disabled nodes
     */
    Tree.prototype.getDisabled = function () {
        return this.findNodes('true', 'g', 'state.disabled');
    };

    /**
     Returns an array of enabled nodes.
     @returns {Array} nodes - Enabled nodes
     */
    Tree.prototype.getEnabled = function () {
        return this.findNodes('false', 'g', 'state.disabled');
    };


    /**
     Set a node state to selected
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.selectNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setSelectedState(node, true, options);
        }, this));

        this.render();
    };

    /**
     Set a node state to unselected
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.unselectNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setSelectedState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Toggles a node selected state; selecting if unselected, unselecting if selected.
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.toggleNodeSelected = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.toggleSelectedState(node, options);
        }, this));

        this.render();
    };


    /**
     Collapse all tree nodes
     @param {optional Object} options
     */
    Tree.prototype.collapseAll = function (options) {
        var identifiers = this.findNodes('true', 'g', 'state.expanded');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setExpandedState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Collapse a given tree node
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.collapseNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setExpandedState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Expand all tree nodes
     @param {optional Object} options
     */
    Tree.prototype.expandAll = function (options) {
        options = $.extend({}, _default.options, options);

        if (options && options.levels) {
            this.expandLevels(this.tree, options.levels, options);
        }
        else {
            var identifiers = this.findNodes('false', 'g', 'state.expanded');
            this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
                this.setExpandedState(node, true, options);
            }, this));
        }

        this.render();
    };

    /**
     Expand a given tree node
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.expandNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setExpandedState(node, true, options);
            if (node.nodes && (options && options.levels)) {
                this.expandLevels(node.nodes, options.levels-1, options);
            }
        }, this));

        this.render();
    };

    Tree.prototype.expandLevels = function (nodes, level, options) {
        options = $.extend({}, _default.options, options);

        $.each(nodes, $.proxy(function (index, node) {
            this.setExpandedState(node, (level > 0) ? true : false, options);
            if (node.nodes) {
                this.expandLevels(node.nodes, level-1, options);
            }
        }, this));
    };

    /**
     Reveals a given tree node, expanding the tree from node to root.
     @param {Object|Number|Array} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.revealNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            var parentNode = this.getParent(node);
            while (parentNode) {
                this.setExpandedState(parentNode, true, options);
                parentNode = this.getParent(parentNode);
            };
        }, this));

        this.render();
    };

    /**
     Toggles a nodes expanded state; collapsing if expanded, expanding if collapsed.
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.toggleNodeExpanded = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.toggleExpandedState(node, options);
        }, this));

        this.render();
    };


    /**
     Check all tree nodes
     @param {optional Object} options
     */
    Tree.prototype.checkAll = function (options) {
        var identifiers = this.findNodes('false', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setCheckedState(node, true, options);
        }, this));

        this.render();
    };

    /**
     Check a given tree node
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.checkNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setCheckedState(node, true, options);
        }, this));

        this.render();
    };

    /**
     Uncheck all tree nodes
     @param {optional Object} options
     */
    Tree.prototype.uncheckAll = function (options) {
        var identifiers = this.findNodes('true', 'g', 'state.checked');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setCheckedState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Uncheck a given tree node
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.uncheckNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setCheckedState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Toggles a nodes checked state; checking if unchecked, unchecking if checked.
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.toggleNodeChecked = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.toggleCheckedState(node, options);
        }, this));

        this.render();
    };


    /**
     Disable all tree nodes
     @param {optional Object} options
     */
    Tree.prototype.disableAll = function (options) {
        var identifiers = this.findNodes('false', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setDisabledState(node, true, options);
        }, this));

        this.render();
    };

    /**
     Disable a given tree node
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.disableNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setDisabledState(node, true, options);
        }, this));

        this.render();
    };

    /**
     Enable all tree nodes
     @param {optional Object} options
     */
    Tree.prototype.enableAll = function (options) {
        var identifiers = this.findNodes('true', 'g', 'state.disabled');
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setDisabledState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Enable a given tree node
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.enableNode = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setDisabledState(node, false, options);
        }, this));

        this.render();
    };

    /**
     Toggles a nodes disabled state; disabling is enabled, enabling if disabled.
     @param {Object|Number} identifiers - A valid node, node id or array of node identifiers
     @param {optional Object} options
     */
    Tree.prototype.toggleNodeDisabled = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.setDisabledState(node, !node.state.disabled, options);
        }, this));

        this.render();
    };


    /**
     Common code for processing multiple identifiers
     */
    Tree.prototype.forEachIdentifier = function (identifiers, options, callback) {

        options = $.extend({}, _default.options, options);

        if (!(identifiers instanceof Array)) {
            identifiers = [identifiers];
        }

        $.each(identifiers, $.proxy(function (index, identifier) {
            callback(this.identifyNode(identifier), options);
        }, this));
    };

    /*
     Identifies a node from either a node id or object
     */
    Tree.prototype.identifyNode = function (identifier) {
        return ((typeof identifier) === 'number' || (typeof identifier) === 'string') ?
            this.nodes.get(parseInt(identifier)) :
            identifier;
    };

    /**
     Searches the tree for nodes (text) that match given criteria
     @param {String} pattern - A given string to match against
     @param {optional Object} options - Search criteria options
     @return {Array} nodes - Matching nodes
     */
    Tree.prototype.search = function (pattern, options) {
        options = $.extend({}, _default.searchOptions, options);

        this.clearSearch({ render: false });

        var results = [];
        if (pattern && pattern.length > 0) {

            if (options.exactMatch) {
                pattern = '^' + pattern + '$';
            }

            var modifier = 'g';
            if (options.ignoreCase) {
                modifier += 'i';
            }

            results = this.findNodes(pattern, modifier);

            // Add searchResult property to all matching nodes
            // This will be used to apply custom styles
            // and when identifying result to be cleared
            $.each(results, function (index, node) {
                node.searchResult = true;
            })
        }

        // If revealResults, then render is triggered from revealNode
        // otherwise we just call render.
        if (options.revealResults) {
            this.revealNode(results);
        }
        else {
            this.render();
        }

        this.$element.trigger('searchComplete', $.extend(true, {}, results));

        return results;
    };

    /**
     Clears previous search results
     */
    Tree.prototype.clearSearch = function (options) {

        options = $.extend({}, { render: true }, options);

        var results = $.each(this.findNodes('true', 'g', 'searchResult'), function (index, node) {
            node.searchResult = false;
        });

        if (options.render) {
            this.render();
        }

        this.$element.trigger('searchCleared', $.extend(true, {}, results));
    };


    /**
     Add new nodes to the tree - used for dynamic loading of data
     @param {Object | Array} pattern - Node(s) to add to the existing tree
     @param {Optional Function} parentFinder - a function that is used to identify a node's parent in the form of function(parent, child) { ... your logic here ...}
     @param {Optional Boolean} rootInsert - if a parent cannot be found for a node should it be inserted as a root node?
     @return {Array} nodes - Nodes that failed to attach to any of the tree's existing nodes
     */
    Tree.prototype.addNodes = function (newNodes, parentFunc, insertAtRoot) {
        if (typeof parentFunc == "undefined" && !insertAtRoot || parentFunc === false) {
            // must match nodes but no matching function was passed
            return newNodes;
        }
        var _this = this;
        var insertToRoot = insertAtRoot;
        if (parentFunc === true) {
            // deal with delete of optional function passing
            insertToRoot = true;
        }
        if (!$.isArray(newNodes) && typeof newNodes === "object" && newNodes !== null) {
            newNodes = [newNodes];
        }
        // for each node in the array try to add it
        var orphans = [];
        while (newNodes.length) {
            var childNode = newNodes.shift();
            if (typeof parentFunc == "function") {
                var parents = this.getNodes(parentFunc, childNode);
            } else {
                var parents = [];
            }
            if (parents.length == 0 && !insertToRoot) {
                // was not able to connect this node to any existing tree members
                orphans.push(childNode);
            } else {
                // found parent(s), prepare to add by making sure the new node has a valid initial state
                childNode = this.singleNodeInitialState.call(this, childNode);
                // add the node to tree and make child of the first parent found
                childNode.nodeId = this.idGenerator();
                this.nodes.set(childNode.nodeId, childNode);
                if (parents.length) {
                    // add under found parent node(s)
                    var parentNode = parents[0];
                    childNode.parentId = parentNode.nodeId;
                    parents.forEach(function(pn) {
                        if (!pn.nodes) {
                            pn.nodes = [];
                        }
                        pn.nodes.push(childNode);
                        if (_this.options.dynamicLoading) {
                            pn.state.requested = false;
                        }
                    });
                } else {
                    // add to tree root
                    this.tree.push(childNode);
                }
            }
        }
        return orphans;
    }

    Tree.prototype.deleteNodes = function (targetNodes, resetDynamicLoading) {
//        this.forEachIdentifier(targetNodes, options, $.proxy(function (node, options) {
//            this.setDisabledState(node, !node.state.disabled, options);
//        }, this));

        var _this = this;
        if (!$.isArray(targetNodes)) {
            targetNodes = [targetNodes];
        }

        // TODO: implement below algorithm if a node can have multiple parents
        // Since the tree allows the same data node to exists with multiple parents we need a slightly different algorithm:
        // 1) find the node(s) to be deleted and mark them along with all their children as to be deleted
        // 2) recurse through the tree again from root and avoid navigation of passed nodes to be deleted,
        // 3) during travel in step 2, unmark any nodes discovered that are previously marked for deletion
        // 4) delete from "treeview.nodes" array any nodes that are still flagged for deletion
        // 5) recurse "treeview.tree" array from root and delete any nodes in the passed list of nodes to be deleted


        // STEP 1: find the node(s) to be deleted and mark them along with all their children as to be deleted
        var recursiveSearchAndDelete = (function (targetIds, subtreeNode) {
            var deletedNodeIds = [];
            if (targetIds.includes(subtreeNode.nodeId)) {
                // this node is targeted for deletion
                if ($.isArray(subtreeNode.nodes)) {
                    // build a list of ids for all child nodes
                    var childIds = [];
                    subtreeNode.nodes.forEach(function(childNode) {
                        childIds.push(childNode.nodeId);
                    });
                    // remove the "nodes" attribute
                    delete subtreeNode.nodes;

                    // recursively delete the children
                    this.nodes.forEach(
                        function (node) { deletedNodeIds = deletedNodeIds.concat(recursiveSearchAndDelete(childIds, node)); }
                    );
                }
                // add current nodeId to the delete list
                deletedNodeIds = deletedNodeIds.concat([subtreeNode.nodeId]);

                return deletedNodeIds;
            } else {
                return [];
            }
        }).bind(_this);

        // start recursive search at root
        var toDeleteNodes = [];
        _this.nodes.forEach(                                                                                            // TODO: Change this to an object
            function (node) { toDeleteNodes = toDeleteNodes.concat(recursiveSearchAndDelete(targetNodes, node)); }
        );

        // go through nodes array of tree and delete all targeted nodes
        toDeleteNodes.forEach((nodeId) => _this.nodes.delete(nodeId));

        // delete any references to targeted nodes from "nodes" array in other (parent) nodes, also reset dynamic loading
        Array.from(_this.nodes.values()).forEach(function (node) {
            if ($.isArray(node.nodes)) {
                var origChildCnt = node.nodes.length;
                node.nodes = node.nodes.filter(function (childNode) {
                    return (!toDeleteNodes.includes(childNode.nodeId));
                });

                // see if this is an affected parent node and reset dynamic load if needed
                if (_this.options.dynamicLoading && origChildCnt !== node.nodes.length && resetDynamicLoading !== false) {
                    node.state.expanded = false;
                    node.state.loaded = false;
                    node.state.requested = false;
                }
            }
        });
        return toDeleteNodes;
    }


    /**
     Get list of nodes in tree that are loading - used for dynamic loading of data
     @param {Optional Boolean} clear - clear the pending load flag in the found node(s)
     @return {Array} nodes - Nodes that have outstanding load requests on them
     */
    Tree.prototype.getNodesLoading = function () {
        // TODO: Implement this
        //(node.state.requested);
        console.error("Tree.prototype.getNodesLoading: Not Implemented!");
    };


    /**
     Clear the loading flag for a single node in tree - used for dynamic loading of data
     @param {Function} selector - function(nodeReference[, passed arguments])
     @param {Optional Mixed} params - one or more passed arguments to be passed to selector function
     @return {Boolean} wasLoading - was the cleared node in the loading state
     */
    Tree.prototype.setNodeLoaded = function () {
        var args = [];
        for (var i in arguments) { args.push(arguments[i]); }
        var nodes = this.getNodes.apply(this, args);
        if (nodes.length == 0) return false;
        // only process the first result of the nodes list
        var node = nodes[0];
        if (node.state.loaded === true) {
            return false;
        }
        node.state.loaded = true;
        return true;
    };


    /**
     Find nodes that match a given criteria
     @param {String} pattern - A given string to match against
     @param {optional String} modifier - Valid RegEx modifiers
     @param {optional String} attribute - Attribute to compare pattern against
     @return {Array} nodes - Nodes that match your criteria
     */
    Tree.prototype.findNodes = function (pattern, modifier, attribute) {

        modifier = modifier || 'g';
        attribute = attribute || 'text';

        var _this = this;
        return $.grep(Array.from(this.nodes.values()), function (node) {
            var val = _this.getNodeValue(node, attribute);
            if (typeof val === 'string') {
                return val.match(new RegExp(pattern, modifier));
            }
        });
    };

    /**
     Recursive find for retrieving nested attributes values
     All values are return as strings, unless invalid
     @param {Object} obj - Typically a node, could be any object
     @param {String} attr - Identifies an object property using dot notation
     @return {String} value - Matching attributes string representation
     */
    Tree.prototype.getNodeValue = function (obj, attr) {
        var index = attr.indexOf('.');
        if (index > 0) {
            var _obj = obj[attr.substring(0, index)];
            var _attr = attr.substring(index + 1, attr.length);
            return this.getNodeValue(_obj, _attr);
        }
        else {
            if (obj.hasOwnProperty(attr)) {
                return obj[attr].toString();
            }
            else {
                return undefined;
            }
        }
    };

    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };

    // Prevent against multiple instantiations,
    // handle updates and method calls
    $.fn[pluginName] = function (options, args) {

        var result;

        this.each(function () {
            var _this = $.data(this, pluginName);
            if (typeof options === 'string') {
                if (!_this) {
                    logError('Not initialized, can not call method : ' + options);
                }
                else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
                    logError('No such method : ' + options);
                }
                else {
                    if (!(args instanceof Array)) {
                        args = [ args ];
                    }
                    result = _this[options].apply(_this, args);
                }
            }
            else if (typeof options === 'boolean') {
                result = _this;
            }
            else {
                $.data(this, pluginName, new Tree(this, $.extend(true, {}, options)));
            }
        });

        return result || this;
    };

})(jQuery, window, document);