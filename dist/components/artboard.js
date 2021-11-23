"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = artboard;

require("core-js-pure/modules/web.dom-collections.iterator.js");

require("core-js-pure/modules/web.url.js");

require("core-js-pure/modules/web.url-search-params.js");

require("core-js-pure/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _reactComponentExportImage = require("react-component-export-image");

var _reactColor = require("react-color");

var _fa = require("react-icons/fa");

var _io = require("react-icons/io");

var _im = require("react-icons/im");

var _md = require("react-icons/md");

require("./styles/artboard.css");

var _rough = _interopRequireDefault(require("roughjs/bundled/rough.esm"));

var _material = require("@mui/material");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}; // const generator = rough.generator();

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const pointIsOnLine = (lineStart, lineEnd, point, name) => {
  const offset = distance(lineStart, lineEnd) - (distance(lineStart, point) + distance(lineEnd, point));
  return Math.abs(offset) < 1 ? name : null;
};

const point = (x, y) => ({
  x,
  y
});

const positionWithinElement = (x, y, element) => {
  const {
    type,
    x1,
    x2,
    y1,
    y2
  } = element; // console.log(type, x1, x2, y1, y2)

  if (type === "img") {
    // console.log("type img")
    const topLeft = nearPoint(x, y, x1, y1, "tl");
    const topRight = nearPoint(x, y, x2, y1, "tr");
    const bottomLeft = nearPoint(x, y, x1, y2, "bl");
    const bottomRight = nearPoint(x, y, x2, y2, "br");
    const top = pointIsOnLine(point(x1, y1), point(x2, y1), point(x, y), "t");
    const right = pointIsOnLine(point(x2, y1), point(x2, y2), point(x, y), "r");
    const bottom = pointIsOnLine(point(x1, y2), point(x2, y2), point(x, y), "b");
    const left = pointIsOnLine(point(x1, y1), point(x1, y2), point(x, y), "l");
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || top || right || bottom || left || inside;
  } else {
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y2, "end");
    const inside = pointIsOnLine(point(x1, y1), point(x2, y2), point(x, y), "inside");
    return start || end || inside;
  }
};

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  return elements.map(element => _objectSpread(_objectSpread({}, element), {}, {
    position: positionWithinElement(x, y, element)
  })).find(element => element.position !== null);
};

const adjustElementCoordinates = element => {
  const {
    type,
    x1,
    y1,
    x2,
    y2,
    image,
    width,
    height
  } = element;

  if (type === "img") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return {
      x1: minX,
      y1: minY,
      x2: maxX,
      y2: maxY,
      image,
      width,
      height
    };
  } else {
    if (x1 < x2 || x1 === x2 && y1 < y2) {
      return {
        x1,
        y1,
        x2,
        y2,
        image,
        width,
        height
      };
    } else {
      return {
        x1: x2,
        y1: y2,
        x2: x1,
        y2: y1,
        image,
        width,
        height
      };
    }
  }
};

const cursorForPosition = position => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";

    case "tr":
    case "bl":
      return "nesw-resize";

    case "t":
    case "b":
      return "ns-resize";

    case "r":
    case "l":
      return "ew-resize";

    default:
      return "move";
  }
};

const resizedCoordinates = (offsetX, offsetY, position, x1, y1, x2, y2, widthX, heightY) => {
  switch (position) {
    case "tl":
    case "start":
      return {
        nx1: offsetX,
        ny1: offsetY,
        nx2: x2,
        ny2: y2,
        nwidthX: x2 - offsetX,
        nheightY: y2 - offsetY
      };

    case "tr":
      return {
        nx1: x1,
        ny1: offsetY,
        nx2: offsetX,
        ny2: y2,
        nwidthX: offsetX - x1,
        nheightY: y2 - offsetY
      };

    case "bl":
      return {
        nx1: offsetX,
        ny1: y1,
        nx2: x2,
        ny2: offsetY,
        nwidthX: x2 - offsetX,
        nheightY: offsetY - y1
      };

    case "br":
    case "end":
      return {
        nx1: x1,
        ny1: y1,
        nx2: offsetX,
        ny2: offsetY,
        nwidthX: offsetX - x1,
        heightY: offsetY - y1
      };

    case "t":
      return {
        nx1: x1,
        ny1: offsetY,
        nx2: x2,
        ny2: y2,
        nwidthX: widthX,
        nheightY: y2 - offsetY
      };

    case "r":
      return {
        nx1: x1,
        ny1: y1,
        nx2: offsetX,
        ny2: y2,
        nwidthX: offsetX - x1,
        nheightY: heightY
      };

    case "b":
      return {
        nx1: x1,
        ny1: y1,
        nx2: x2,
        ny2: offsetY,
        nwidthX: widthX,
        nheightY: offsetY - y1
      };

    case "l":
      return {
        nx1: offsetX,
        ny1: y1,
        nx2: x2,
        ny2: y2,
        nwidthX: x2 - offsetX,
        nheightY: heightY
      };

    default:
      return null;
  }
};

function artboard(props) {
  let restoreArray = []; // for undo 

  let arrayIndex = -1; // array index for undo array

  const [itemNo, setItemNo] = (0, _react.useState)();
  const [isDrawing, setIsDrawing] = (0, _react.useState)(false); // to now drawing state

  const [pencil, setPencil] = (0, _react.useState)({
    color: 'black',
    width: '2'
  }); // for pencil style

  const [textArray, setTextArray] = (0, _react.useState)([]); // for storing text data

  const [textArrayIndex, setTextArrayIndex] = (0, _react.useState)(-1);
  const [openI, setOpenI] = (0, _react.useState)(false); // for opening style modal

  const [file, setFile] = (0, _react.useState)(null); // for image file

  const [elements, setElements] = (0, _react.useState)([]); // for image array

  const [drawArray, setDrawArray] = (0, _react.useState)([{
    color: '',
    width: '',
    x: [],
    y: []
  }]); // for storing drawing data

  const [tool, setTool] = (0, _react.useState)("pen"); // for selection tool

  const [action, setAction] = (0, _react.useState)("none"); // for action state : select or resize

  const [selectedElement, setSelectedElement] = (0, _react.useState)(null); // for selected image

  const [penOpen, setPenOpen] = (0, _react.useState)(false); // for more option in pen

  const [eraseOpen, setEraseOpen] = (0, _react.useState)(false); // for more option in erase

  const canvasRef = (0, _react.useRef)(null);
  const contextRef = (0, _react.useRef)(null);
  const canvasInput = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    setElements(props.images);
    setTextArray(props.text);
    setDrawArray(props.draw); // var drawStore = JSON.parse(sessionStorage.getItem('draw ' + itemNo))
    // var textStore = JSON.parse(sessionStorage.getItem('text ' + itemNo))
    // var imageStore = JSON.parse(sessionStorage.getItem('image ' + itemNo))
    // drawStore !== null ? setDrawArray(drawStore) : setDrawArray(props.draw)
    // textStore !== null ? setTextArray(textStore) : setDrawArray(props.text)
    // imageStore !== null ? setElements(imageStore) : setTextArray(props.images)

    setItemNo(props.itemno);
  }, []);
  (0, _react.useEffect)(() => {
    setElements(props.images);
  }, [props.images]);
  (0, _react.useEffect)(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = "".concat(window.innerWidth, "px");
    canvas.style.height = "".concat(window.innerHeight, "px");
    const context = canvas.getContext("2d"); //context.scale(2, 2);

    context.lineCap = "round";
    contextRef.current = context; // redrawing every image on value change of image

    elements.length > 0 && elements.forEach(imageElement => {
      //console.log(imageElement)
      const {
        image,
        x1,
        y1,
        widthX,
        heightY
      } = imageElement;
      Object.keys(imageElement.image).length === 0 && imageElement.image.constructor === Object ? // returns true if image object is empty
      console.log('no image') : contextRef.current.drawImage(image, x1, y1, widthX, heightY);
    }); // textArray.forEach((textElement) => {
    //     const { x, y, promptText } = textElement
    //     writeText(x, y, promptText)
    // })
    // redrawing every drawing on vlue change of image

    drawArray.forEach(drawElement => {
      const {
        color,
        width,
        x,
        y
      } = drawElement;
      drawLibrary(color, width, x, y);
    });
  }, [elements]); // const updateSessionStorage = (type, itemNo, store, array) => {
  //     console.log('updating store')
  //     console.log(array)
  //     array.forEach((arrayElement) => {
  //         store.push(arrayElement)
  //     })
  //     sessionStorage.setItem(type + itemNo, JSON.stringify(store))
  // }
  // constant update state of parent on update of artboard
  // draw update

  (0, _react.useEffect)(() => {
    props.onSaveDraw(drawArray);
  }, [drawArray]); //text update 

  (0, _react.useEffect)(() => {
    props.onSaveText(textArray);
  }, [textArray]); // image update

  (0, _react.useEffect)(() => {
    props.onSaveImages(elements);
  }, [elements]); // Saving the data in session storage

  (0, _react.useEffect)(() => {
    var drawStore = sessionStorage.getItem('draw ' + itemNo);
    var textStore = sessionStorage.getItem('text ' + itemNo);
    var imageStore = sessionStorage.getItem('image ' + itemNo); // var drawStoreClone = 

    sessionStorage.setItem('draw ' + itemNo, JSON.stringify(drawArray));
    sessionStorage.setItem('text ' + itemNo, JSON.stringify(textArray));
    sessionStorage.setItem('images ' + itemNo, JSON.stringify(elements));
  }, [elements, drawArray, textArray]); // drawing image

  const createElement = (id, x1, y1, x2, y2, type, image, widthX, heightY) => {
    clearCanvas();
    contextRef.current.drawImage(image, x1, y1, widthX, heightY);
    return {
      id,
      x1,
      y1,
      x2,
      y2,
      type,
      image,
      widthX,
      heightY
    };
  }; // updating image


  const updateElement = (id, x1, y1, x2, y2, type, image, widthX, heightY) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type, image, widthX, heightY);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  }; // drawing drawings


  const drawLibrary = (color, width, x, y) => {
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = width;
    contextRef.current.lineCap = "round";
    contextRef.current.beginPath();
    contextRef.current.moveTo(x[0], y[1]);

    for (let i = 0; i < x.length; i++) {
      contextRef.current.lineTo(x[i], y[i]);
    }

    contextRef.current.stroke();
    contextRef.current.closePath();
  }; // change pen style


  (0, _react.useEffect)(() => {
    contextRef.current.strokeStyle = pencil.color;
    contextRef.current.lineWidth = pencil.width;
  }, [pencil]); // start drawing or on mouse click and move

  const startDrawing = _ref => {
    let {
      nativeEvent
    } = _ref;
    // const { type } = nativeEvent
    // if ( type === 'mousedown') {
    //     const { offsetX, offsetY } = nativeEvent
    // } else {
    //     const offsetX = nativeEvent.changedTouches[0].clientX
    //     const offsetY = nativeEvent.changedTouches[0].clientY
    // }
    var offsetX;
    var offsetY;
    const {
      type
    } = nativeEvent;

    if (type === 'mousedown') {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    } else {
      var rect = nativeEvent.target.getBoundingClientRect();
      offsetX = nativeEvent.changedTouches[0].pageX - rect.left;
      offsetY = nativeEvent.changedTouches[0].pageY - rect.top;
    }

    if (tool === "selection") {
      const element = getElementAtPosition(offsetX, offsetY, elements);

      if (element) {
        const clientX = offsetX - element.x1;
        const clientY = offsetY - element.y1;
        setSelectedElement(_objectSpread(_objectSpread({}, element), {}, {
          clientX,
          clientY
        }));

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setDrawArray([...drawArray, {
        x: [offsetX],
        y: [offsetY],
        color: pencil.color,
        width: pencil.width
      }]);
      setIsDrawing(true);
    }
  }; // on mouse move


  const draw = _ref2 => {
    let {
      nativeEvent
    } = _ref2;
    var offsetX;
    var offsetY;
    const {
      type
    } = nativeEvent;

    if (type === 'mousemove') {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    } else {
      var rect = nativeEvent.target.getBoundingClientRect();
      offsetX = nativeEvent.changedTouches[0].pageX - rect.left;
      offsetY = nativeEvent.changedTouches[0].pageY - rect.top;
    }

    var drawArrayClone = _objectSpread({}, drawArray);

    if (tool === "selection") {
      const element = getElementAtPosition(offsetX, offsetY, elements);
      nativeEvent.target.style.cursor = element ? cursorForPosition(element.position) : "default";
    } else if (tool === 'pen') {
      window.document.getElementById('canvas').style.cursor = "crosshair";
    }

    if (action === 'movingText') {
      window.document.getElementById('canvas').style.cursor = "grabbing";
      textArray[textArrayIndex].x = offsetX;
      textArray[textArrayIndex].y = offsetY;
    } else if (action === "moving") {
      const {
        id,
        x1,
        x2,
        y1,
        y2,
        type,
        clientX,
        clientY,
        image,
        widthX,
        heightY
      } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX1 = offsetX - clientX;
      const newY1 = offsetY - clientY;
      updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, image, widthX, heightY);
    } else if (action === "resizing") {
      const {
        id,
        type,
        position,
        x1,
        y1,
        x2,
        y2,
        image,
        widthX,
        heightY
      } = selectedElement;
      const {
        nx1,
        ny1,
        nx2,
        ny2,
        nwidthX,
        nheightY
      } = resizedCoordinates(offsetX, offsetY, position, x1, y1, x2, y2, widthX, heightY);
      updateElement(id, nx1, ny1, nx2, ny2, type, image, nwidthX, nheightY);
    }

    if (!isDrawing) {
      return;
    }

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    drawArray[drawArray.length - 1].x = [...drawArray[drawArray.length - 1].x, offsetX];
    drawArray[drawArray.length - 1].y = [...drawArray[drawArray.length - 1].y, offsetY]; // drawArrayClone[drawArrayClone.length - 1].x = [...drawArray[drawArrayClone.length - 1].x, offsetX]
    // drawArrayClone[drawArrayClone.length - 1].y = [...drawArray[drawArrayClone.length - 1].y, offsetY]
    // setDrawArray(drawArrayClone)
  }; // on mouse unclick or mouse up


  const finishDrawing = () => {
    const canvas = canvasRef.current; // if (selectedElement) {
    //     const index = selectedElement.id;
    //     const { id, type } = elements[index];
    //     if (action === "drawing" || action === "resizing") {
    //         const { x1, y1, x2, y2, image, widthX, heightY } = adjustElementCoordinates(elements[index]);
    //         updateElement(id, x1, y1, x2, y2, type, image, widthX, heightY);
    //     }
    // }

    setAction("none");
    setSelectedElement(null);
    contextRef.current.closePath(); //restoreArray.push(contextRef.current.getImageData(0, 0, canvas.width, canvas.height))
    //arrayIndex += 1

    setIsDrawing(false);
  }; // to get the position of pointer for creating text box


  const getPosition = _ref3 => {
    let {
      nativeEvent
    } = _ref3;
    var offsetX;
    var offsetY;
    const {
      type
    } = nativeEvent;

    if (type === 'mousedown') {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    } else {
      var rect = nativeEvent.target.getBoundingClientRect();
      offsetX = nativeEvent.changedTouches[0].pageX - rect.left;
      offsetY = nativeEvent.changedTouches[0].pageY - rect.top;
    }

    setTextArray([...textArray, {
      x: offsetX,
      y: offsetY
    }]);
    setTextArrayIndex(textArrayIndex + 1); // const inputText = document.createElement("textarea")
    // canvasInput.current.appendChild(inputText)
    // inputText.style.position = "absolute"
    // inputText.style.left = offsetX + 'px'
    // inputText.style.top = offsetY + 'px'
    // let writenText = ''
    // var promtText = prompt()
    // const removeText = document.querySelectorAll('textarea')
    // console.log(removeText)
    // if (removeText != null) {
    //     removeText.forEach(element => {
    //         canvasInput.current.removeChild(element)
    //     })
    // };
  };

  const moveText = (e, x, y) => {
    // const { offsetX, offsetY } = nativeEvent;
    window.document.getElementById('canvas').style.cursor = "grabbing";
    const posIndex = textArray.forEach((pos, index) => {
      if (pos.x === x && pos.y === y) {
        setTextArrayIndex(index);
      }
    });
    setAction('movingText');
  };

  const movingText = _ref4 => {
    let {
      nativeEvent
    } = _ref4;
    var offsetX;
    var offsetY;
    const {
      type
    } = nativeEvent;

    if (type === 'mousemove') {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    } else {
      var rect = nativeEvent.target.getBoundingClientRect();
      offsetX = nativeEvent.changedTouches[0].pageX - rect.left;
      offsetY = nativeEvent.changedTouches[0].pageY - rect.top;
    }

    if (action === 'movingText') {
      window.document.getElementById('canvas').style.cursor = "grabbing";
      textArray[textArrayIndex].x = offsetX;
      textArray[textArrayIndex].y = offsetY;
    } else {
      window.document.getElementById('canvas').style.cursor = "text";
    }
  };

  const movedText = () => {
    setAction("text");
  };

  const writeTextInput = (e, x, y) => {
    e.preventDefault();
    var textArrayTwo = [...textArray];
    textArrayTwo.forEach((pos, index) => {
      if (pos.x === x && pos.y === y) {
        textArrayTwo[index].promptText = e.target.value;
        setTextArray(textArrayTwo);
      }
    });
  };

  const getTextBox = (e, x, y) => {
    textArray.forEach((pos, index) => {
      if (pos.x === x && pos.y === y) {
        setTextArrayIndex(index);
      }
    });
  };

  const deleteTextInput = (e, x, y) => {
    setTextArray(textArray.filter(pos => pos.x !== x && pos.y !== y));
  }; // on slecting pen tool


  const selectPen = () => {
    setTool('pen');
    window.document.getElementById('canvas').style.cursor = "crosshair";
    const pencilMore = document.getElementById('pencil');
    const eraserMore = document.getElementById('eraser');
    pencilMore.style.display = "block";
    eraserMore.style.display = "none";
    setPencil(_objectSpread(_objectSpread({}, pencil), {}, {
      color: 'black',
      width: 2
    }));
  }; // on selecting text tool


  const selectText = () => {
    setTool('text');
    window.document.getElementById('canvas').style.cursor = "text";
  }; // on selecting eraser tool


  const selectErase = e => {
    setTool('eraser');
    setPencil(_objectSpread(_objectSpread({}, pencil), {}, {
      color: 'white',
      width: 20
    }));
    window.document.getElementById('canvas').style.cursor = "crosshair";
    const pencilMore = document.getElementById('pencil');
    const eraserMore = document.getElementById('eraser');
    pencilMore.style.display = "none";
    eraserMore.style.display = "block";
  }; // on selecting image tool


  const handleImage = e => {
    e.preventDefault();
    handleCloseI();
    var reader = new FileReader();
    reader.readAsDataURL(file);
    console.log(file);

    reader.onloadend = () => {
      var myImage = new Image(); // Creates image object

      myImage.src = URL.createObjectURL(file); // Assigns converted image to image object

      myImage.onload = () => {
        console.log(myImage);
        const id = elements.length;
        const element = createElement(id, 100, 100, myImage.width * 0.5 + 100, myImage.height * 0.5 + 100, "img", myImage, myImage.width * 0.5, myImage.height * 0.5);
        setElements(prevState => [...prevState, element]);
        setSelectedElement(element); // contextRef.current.drawImage(myImage, 100, 100, myImage.width * 0.5, myImage.height * 0.5); // Draws the image on canvas
        // let imgData = contextRef.current.toDataURL("image/jpeg", 0.75);
      };
    };
  }; // on selecting clear tool


  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height); // const removeText = document.querySelectorAll('textarea')
    // console.log(removeText)
    // if (removeText != null) {
    //     removeText.forEach(element => {
    //         canvasInput.current.removeChild(element)
    //     })
    // };
  };

  const deleteCanvas = () => {
    setTextArray([]);
    setDrawArray([]);
    setElements([]);
  }; // on selecting download tool
  // const download = async () => {
  //     textArray.forEach((textElement) => {
  //         const { x, y, promptText } = textElement
  //         writeText(x, y, promptText)
  //     })
  //     const image = canvasRef.current.toDataURL('image/png');
  //     const blob = await (await fetch(image)).blob();
  //     const blobURL = URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = blobURL;
  //     link.download = "image.png";
  //     link.click();
  // }


  const download = async () => {
    const oldCanvas = canvasRef.current; //create a new canvas

    var newCanvas = document.createElement('canvas');
    var newContext = newCanvas.getContext('2d'); //set dimensions

    newCanvas.width = contextRef.current.width;
    newCanvas.height = contextRef.current.height; //apply the old canvas to the new one

    newContext.drawImage(oldCanvas, 0, 0);
    textArray.forEach(textElement => {
      const {
        x,
        y,
        promptText
      } = textElement;
      writeText(newContext, x, y, promptText);
    }); //return the new canvas

    const image = canvasRef.current.toDataURL('image/png');
    const blob = await (await fetch(image)).blob();
    const blobURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = "image.png";
    link.click();
  };

  const handleChangeComplete = color => {
    setPencil(_objectSpread(_objectSpread({}, pencil), {}, {
      color: color.hex
    }));
  };

  const handleOpenI = () => setOpenI(true);

  const handleCloseI = () => setOpenI(false);

  const writeText = function writeText(newContext, x, y, text) {
    let style = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    // const { text, x, y } = info;
    const {
      fontSize = 20,
      fontFamily = 'Arial',
      color = 'black',
      textAlign = 'left',
      textBaseline = 'top'
    } = style;
    newContext.beginPath();
    newContext.font = fontSize + 'px ' + fontFamily;
    newContext.textAlign = textAlign;
    newContext.textBaseline = textBaseline;
    newContext.fillStyle = color;
    newContext.fillText(text, x, y);
    newContext.stroke();
  };

  (0, _react.useEffect)(() => {
    const pencilMore = document.getElementById('pencil');
    tool === 'pen' ? pencilMore.style.display = "block" : pencilMore.style.display = "none";
  }, [tool]); // UseEffect(() => {
  //     document.body.onmousemove = function (e) {
  //         var mouse = document.getElementById('circularcursor')
  //         if (tool === 'eraser') {
  //             window.document.getElementById('canvas').style.cursor = "none"
  //             mouse.style.display = "block"
  //             mouse.style.setProperty('left', (e.offsetX) + 'px')
  //             mouse.style.setProperty('top', (e.offsetY + 40) + 'px')
  //             mouse.style.setProperty('height', (pencil.width) + 'px')
  //             mouse.style.setProperty('width', (pencil.width) + 'px')
  //         } else {
  //             mouse ? mouse.style.display = "none" : nothing()
  //             //mouse.style.display = "none"
  //         }
  //     }
  // }, [tool, pencil.width])

  const nothing = () => {};

  return /*#__PURE__*/_react.default.createElement("div", {
    className: ""
  }, /*#__PURE__*/_react.default.createElement("div", {
    id: "circularcursor"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "App",
    ref: canvasInput
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "canvas-container"
  }, textArray && textArray.map((pos, index) => /*#__PURE__*/_react.default.createElement("div", {
    style: {
      position: "absolute",
      left: "".concat(pos.x, "px"),
      top: "".concat(pos.y, "px")
    },
    className: "textInput"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex"
  }, /*#__PURE__*/_react.default.createElement(_material.IconButton, null, /*#__PURE__*/_react.default.createElement(_io.IoMdMove, {
    style: {
      position: "absolute"
    },
    onClick: e => moveText(e, pos.x, pos.y),
    className: "text-move"
  })), /*#__PURE__*/_react.default.createElement(_material.IconButton, null, /*#__PURE__*/_react.default.createElement(_io.IoMdCloseCircle, {
    style: {
      position: "absolute",
      top: '-5px',
      right: '-10px'
    },
    onClick: e => deleteTextInput(e, pos.x, pos.y)
  }))), /*#__PURE__*/_react.default.createElement("textarea", {
    id: index,
    cols: 10,
    rows: 3,
    className: "form-control",
    style: {
      position: "absolute",
      minWidth: '100px'
    },
    value: pos.promptText,
    onChange: e => writeTextInput(e, pos.x, pos.y) // onClick={(e) => getTextBox(e, pos.x, pos.y)}

  }))), /*#__PURE__*/_react.default.createElement("canvas", {
    className: "drawing-board",
    id: "canvas",
    onMouseDown: tool === 'text' ? getPosition : startDrawing,
    onMouseMove: tool === 'text' ? movingText : draw,
    onMouseUp: tool === 'text' ? movedText : finishDrawing,
    onTouchStart: tool === 'text' ? getPosition : startDrawing,
    onTouchMove: tool === 'text' ? movingText : draw,
    onTouchEnd: tool === 'text' ? movedText : finishDrawing,
    ref: canvasRef
  }))), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-bar"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => setTool("selection"),
    className: tool === 'selection' ? 'disabled' : ''
  }, /*#__PURE__*/_react.default.createElement(_fa.FaHandPointer, null))), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", null, /*#__PURE__*/_react.default.createElement(_fa.FaPenAlt, {
    onClick: selectPen,
    className: tool === 'pen' ? 'disabled' : ''
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "pen-style-open",
    id: "pencil"
  }, penOpen ? /*#__PURE__*/_react.default.createElement(_fa.FaAngleDoubleLeft, {
    onClick: () => setPenOpen(!penOpen)
  }) : /*#__PURE__*/_react.default.createElement(_fa.FaAngleDoubleRight, {
    onClick: () => setPenOpen(!penOpen)
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: penOpen ? "pen-menu-open" : "pen-menu-close"
  }, /*#__PURE__*/_react.default.createElement(_reactColor.BlockPicker, {
    color: pencil.color,
    onChangeComplete: handleChangeComplete
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "pen-width"
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: "pen-width-view"
  }, pencil.width), /*#__PURE__*/_react.default.createElement("input", {
    id: "typeinp",
    type: "range",
    min: "0",
    max: "10",
    step: "0.5",
    defaultValue: pencil.width,
    onChange: e => setPencil(_objectSpread(_objectSpread({}, pencil), {}, {
      width: e.target.value
    }))
  })))))), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: selectText,
    className: tool === 'text' ? 'disabled' : ''
  }, /*#__PURE__*/_react.default.createElement("strong", null, "T"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", null, /*#__PURE__*/_react.default.createElement(_fa.FaEraser, {
    onClick: selectErase,
    className: tool === 'eraser' ? 'disabled' : ''
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "erase-style-open",
    id: "eraser"
  }, eraseOpen ? /*#__PURE__*/_react.default.createElement(_fa.FaAngleDoubleLeft, {
    onClick: () => setEraseOpen(!eraseOpen)
  }) : /*#__PURE__*/_react.default.createElement(_fa.FaAngleDoubleRight, {
    onClick: () => setEraseOpen(!eraseOpen)
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: eraseOpen ? "pen-menu-open" : "pen-menu-close"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "pen-width"
  }, /*#__PURE__*/_react.default.createElement("p", {
    className: "pen-width-view"
  }, pencil.width), /*#__PURE__*/_react.default.createElement("input", {
    id: "typeinp",
    type: "range",
    min: "10",
    max: "30",
    step: "2",
    defaultValue: pencil.width,
    onChange: e => setPencil(_objectSpread(_objectSpread({}, pencil), {}, {
      width: e.target.value
    }))
  })))))), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: handleOpenI
  }, /*#__PURE__*/_react.default.createElement(_fa.FaImages, null))), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: deleteCanvas
  }, /*#__PURE__*/_react.default.createElement(_md.MdDelete, null))), /*#__PURE__*/_react.default.createElement("div", {
    className: "menu-item"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: () => (0, _reactComponentExportImage.exportComponentAsPNG)(canvasInput)
  }, /*#__PURE__*/_react.default.createElement(_fa.FaDownload, null)))), /*#__PURE__*/_react.default.createElement("div", {
    className: "save-btn"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: e => props.onSave(e, elements, drawArray, textArray)
  }, "Save ", /*#__PURE__*/_react.default.createElement(_fa.FaSave, null))), /*#__PURE__*/_react.default.createElement(_material.Modal, {
    open: openI,
    onClose: handleCloseI,
    "aria-labelledby": "modal-modal-title",
    "aria-describedby": "modal-modal-description"
  }, /*#__PURE__*/_react.default.createElement(_material.Box, {
    sx: style
  }, /*#__PURE__*/_react.default.createElement("form", {
    onSubmit: handleImage
  }, /*#__PURE__*/_react.default.createElement("label", null, "Upload File"), /*#__PURE__*/_react.default.createElement("input", {
    type: "file",
    id: "file",
    accept: ".png,.jpeg,.jpg",
    onChange: e => setFile(e.target.files[0])
  }), /*#__PURE__*/_react.default.createElement("button", {
    type: "submit"
  }, "Submit"), /*#__PURE__*/_react.default.createElement("br", null), file ? /*#__PURE__*/_react.default.createElement("div", {
    className: "book-preview"
  }, /*#__PURE__*/_react.default.createElement("img", {
    className: "preview-img",
    src: URL.createObjectURL(file),
    alt: "",
    width: "200px"
  }), /*#__PURE__*/_react.default.createElement(_im.ImCancelCircle, {
    className: "sell-cancel-svg",
    onClick: () => setFile(null)
  })) : /*#__PURE__*/_react.default.createElement("div", null)))));
}