(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{45:function(module,__webpack_exports__,__webpack_require__){"use strict";eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);\n\n\nfunction rating(form) {\n  var buttons = form.querySelectorAll('.reviewer__stars button');\n  var input = form.querySelector('input');\n  buttons.on('click', function (e) {\n    input.value = this.dataset.rating;\n    buttons.forEach(function (e) {\n      e.classList.remove('active');\n      e.style.pointerEvents = 'none';\n    });\n    this.classList.add('active');\n    axios__WEBPACK_IMPORTED_MODULE_0___default.a.post(form.action, {\n      rating: input.value\n    }).then(function (res) {\n      if (res.data) {\n        var nmberOfRating = document.querySelector('#nmberOfRating');\n        nmberOfRating.innerHTML = Number(nmberOfRating.innerHTML) + 1;\n      }\n\n      buttons.forEach(function (e) {\n        return e.style.pointerEvents = null;\n      });\n    }).catch(console.log);\n  });\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (rating);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNDUuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvbW9kdWxlcy9yYXRpbmcuanM/MWM1YyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5mdW5jdGlvbiByYXRpbmcoZm9ybSkge1xuICBjb25zdCBidXR0b25zID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcucmV2aWV3ZXJfX3N0YXJzIGJ1dHRvbicpO1xuICBjb25zdCBpbnB1dCA9IGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgYnV0dG9ucy5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgaW5wdXQudmFsdWUgPSB0aGlzLmRhdGFzZXQucmF0aW5nO1xuICAgIGJ1dHRvbnMuZm9yRWFjaChlID0+IHtcbiAgICAgIGUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICBlLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgfSk7XG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBheGlvc1xuICAgICAgLnBvc3QoZm9ybS5hY3Rpb24sIHsgcmF0aW5nOiBpbnB1dC52YWx1ZSB9KVxuICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgaWYgKHJlcy5kYXRhKSB7XG4gICAgICAgICAgY29uc3Qgbm1iZXJPZlJhdGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNubWJlck9mUmF0aW5nJyk7XG4gICAgICAgICAgbm1iZXJPZlJhdGluZy5pbm5lckhUTUwgPSBOdW1iZXIobm1iZXJPZlJhdGluZy5pbm5lckhUTUwpICsgMTtcbiAgICAgICAgfVxuICAgICAgICBidXR0b25zLmZvckVhY2goZSA9PiAoZS5zdHlsZS5wb2ludGVyRXZlbnRzID0gbnVsbCkpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCByYXRpbmc7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///45\n")}}]);