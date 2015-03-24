/**
 * Add GitHub link in header
 */
QUnit.begin(function(){
  $('#qunit-header').append(
    '<div class="pull-right" style="margin:-5px 10px 0 0">' +
      '<a href="https://github.com/mistic100/jQuery-QueryBuilder">' +
  '<img src="https://assets.github.com/images/icons/emoji/octocat.png" width=32px height=32px>' +
      '</a>' +
    '</div>'
  );
});

/**
 * Modify Blanket results display
 */
QUnit.done(function(){
  $('#blanket-main')
    .css('marginTop', '10px')
    .addClass('col-lg-8 col-lg-push-2')
    .find('.bl-file a').each(function(){
      this.innerHTML = this.innerHTML.replace(/(.*)\/src\/(.*)$/, '$2');
    });
});

/**
 * Custom assert to compare rules objects
 */
QUnit.assert.rulesMatch = function(actual, expected, message) {
  var ok = (function match(a, b){
    var ok = true;

    if (a.hasOwnProperty('rules')) {
      if (!b.hasOwnProperty('rules')) {
        ok = false;
      }
      else {
        for (var i=0, l=a.rules.length; i<l; i++) {
          if (b.rules[i]===undefined || !match(a.rules[i], b.rules[i])) {
            ok = false;
            break;
          }
        }

        for (var i=0, l=b.rules.length; i<l; i++) {
          if (a.rules[i]===undefined || !match(a.rules[i], b.rules[i])) {
            ok = false;
            break;
          }
        }
      }

      ok&= a.condition == b.condition;
    }
    else {
      if ($.isArray(a.value)) {
        ok&= $(a.value).not(b.value).length == 0 && $(b.value).not(a.value).length == 0;
      }
      else {
        ok&= a.value==b.value;
      }

      ok&= a.id==b.id && a.operator==b.operator;
    }

    return ok;
  }(actual, expected));

  this.push(ok, actual, expected, message);
};

/**
 * Custom assert for validation errors
 */
QUnit.assert.validationError = function($b, rule, code) {
  $b.queryBuilder('setRules', {
    rules: [rule]
  });

  $b.queryBuilder('on', 'validationError', function(node, error) {
    throw error[0];
  });

  this.throws(
    function() { $b.queryBuilder('validate'); },
    code,
    'Should throw "' + code + '" error'
  );

  $b.queryBuilder('off', 'validationError');
};

/**
 * Custom assert to test option or inputs list (in order)
 */
QUnit.assert.optionsMatch = function($target, expected, message) {
  var options = [];

  $target.each(function(){
    options.push($(this).val());
  });

  this.deepEqual(options, expected, message);
};

/**
 * Custom assert to test a regex
 */
QUnit.assert.match = function(actual, regex, message) {
  this.push(regex.test(actual), actual, regex, message);
};

/**
 * Drag & Drop simulation
 * https://gist.github.com/mistic100/37c95fab77b5626c5623
 */
(function($) {
  $.fn.simulateDragDrop = function(options) {
    return this.each(function() {
      new $.simulateDragDrop(this, options);
    });
  };

  $.simulateDragDrop = function(elem, options) {
    var that = this;

    this.options = options;
    this.elem = elem;

    if (this.options.start) {
      this.options.start.call(this.elem);
    }

    setTimeout(function() {
      that.dragstart();
    }, this.options.dragStartDelay || 0);
  };

  $.extend($.simulateDragDrop.prototype, {
    dragstart: function() {
      var that = this;

      var event = this.createEvent('dragstart');
      this.dispatchEvent(this.elem, 'dragstart', event);

      setTimeout(function() {
        that.drop(event);
      }, this.options.dropDelay || 0);
    },
    drop: function(event) {
      var that = this;

      var dropEvent = this.createEvent('drop');
      dropEvent.dataTransfer = event.dataTransfer;
      this.dispatchEvent($(this.options.dropTarget)[0], 'drop', dropEvent);

      setTimeout(function() {
        that.dragend(event);
      }, this.options.dragEndDelay || 0);
    },
    dragend: function(event) {
      var dragEndEvent = this.createEvent('dragend');
      dragEndEvent.dataTransfer = event.dataTransfer;
      this.dispatchEvent(this.elem, 'dragend', dragEndEvent);

      if (this.options.done) {
        this.options.done.call(this.elem);
      }
    },
    createEvent: function(type) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, null);
      event.dataTransfer = {
        data: {},
        setData: function(type, val) {
          this.data[type] = val;
        },
        getData: function(type) {
          return this.data[type];
        }
      };
      return event;
    },
    dispatchEvent: function(elem, type, event) {
      if (elem.dispatchEvent) {
        elem.dispatchEvent(event);
      }
      else if (elem.fireEvent) {
        elem.fireEvent('on' + type, event);
      }
    }
  });
})(jQuery);


var basic_filters = [{
  id: 'name',
  label: 'Name',
  type: 'string'
}, {
  id: 'category',
  label: 'Category',
  type: 'string',
  input: 'select',
  multiple: true,
  values: {
    'bk': 'Books',
    'mo': 'Movies',
    'mu': 'Music',
    'to': 'Tools',
    'go': 'Goodies',
    'cl': 'Clothes'
  },
  operators: ['in', 'not_in', 'equal', 'not_equal', 'is_null', 'is_not_null']
}, {
  id: 'in_stock',
  label: 'In stock',
  type: 'integer',
  input: 'radio',
  values: {
    1: 'Yes',
    0: 'No'
  },
  operators: ['equal']
}, {
  id: 'price',
  label: 'Price',
  type: 'double',
  validation: {
    min: 0,
    step: 0.01
  },
  description: 'Lorem ipsum sit amet'
},  {
  id: 'id',
  label: 'Identifier',
  type: 'string',
  placeholder: '____-____-____',
  operators: ['equal', 'not_equal'],
  validation: {
    format: /^.{4}-.{4}-.{4}$/
  }
}];

var basic_rules = {
  condition: 'AND',
  rules: [{
    id: 'price',
    field: 'price',
    operator: 'less',
    value: 10.25
  }, {
    id: 'name',
    field: 'name',
    operator: 'is_null',
    value: null
  }, {
    condition: 'OR',
    rules: [{
      id: 'category',
      field: 'category',
      operator: 'in',
      value: ['mo', 'mu']
    }, {
      id: 'id',
      field: 'id',
      operator: 'not_equal',
      value: '1234-azer-5678'
    }]
  }]
};