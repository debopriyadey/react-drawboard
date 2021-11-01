import React, { useEffect as UseEffect, useState as UseState, useRef as UseRef } from 'react'
import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';

import { SketchPicker } from 'react-color';

import { FaPenAlt, FaImages, FaEraser, FaHandPointer, FaAngleDoubleLeft, FaAngleDoubleRight, FaDownload, FaSave } from 'react-icons/fa';
import { IoMdCloseCircle, IoMdMove } from 'react-icons/io'
import { ImCancelCircle } from 'react-icons/im'
import { MdDelete } from 'react-icons/md'

import './styles/artboard.css'

import rough from 'roughjs/bundled/rough.esm';
import { Modal, Box, IconButton } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


// const generator = rough.generator();

const nearPoint = (x, y, x1, y1, name) => {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

const pointIsOnLine = (lineStart, lineEnd, point, name) => {
    const offset = distance(lineStart, lineEnd) - (distance(lineStart, point) + distance(lineEnd, point));
    return Math.abs(offset) < 1 ? name : null;
};

const point = (x, y) => ({ x, y });

const positionWithinElement = (x, y, element) => {
    const { type, x1, x2, y1, y2 } = element;
    // console.log(type, x1, x2, y1, y2)
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
        return (
            topLeft || topRight || bottomLeft || bottomRight || top || right || bottom || left || inside
        );
    } else {
        const start = nearPoint(x, y, x1, y1, "start");
        const end = nearPoint(x, y, x2, y2, "end");
        const inside = pointIsOnLine(point(x1, y1), point(x2, y2), point(x, y), "inside")
        return start || end || inside;
    }
};

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
    return elements
        .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
        .find(element => element.position !== null);
};

const adjustElementCoordinates = element => {
    const { type, x1, y1, x2, y2, image, width, height } = element;
    if (type === "img") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return { x1: minX, y1: minY, x2: maxX, y2: maxY, image, width, height };
    } else {
        if (x1 < x2 || (x1 === x2 && y1 < y2)) {
            return { x1, y1, x2, y2, image, width, height };
        } else {
            return { x1: x2, y1: y2, x2: x1, y2: y1, image, width, height };
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
            return { nx1: offsetX, ny1: offsetY, nx2: x2, ny2: y2, nwidthX: x2 - offsetX, nheightY: y2 - offsetY };
        case "tr":
            return { nx1: x1, ny1: offsetY, nx2: offsetX, ny2: y2, nwidthX: offsetX - x1, nheightY: y2 - offsetY };
        case "bl":
            return { nx1: offsetX, ny1: y1, nx2: x2, ny2: offsetY, nwidthX: x2 - offsetX, nheightY: offsetY - y1 };
        case "br":
        case "end":
            return { nx1: x1, ny1: y1, nx2: offsetX, ny2: offsetY, nwidthX: offsetX - x1, heightY: offsetY - y1 };
        case "t":
            return { nx1: x1, ny1: offsetY, nx2: x2, ny2: y2, nwidthX: widthX, nheightY: y2 - offsetY };
        case "r":
            return { nx1: x1, ny1: y1, nx2: offsetX, ny2: y2, nwidthX: offsetX - x1, nheightY: heightY };
        case "b":
            return { nx1: x1, ny1: y1, nx2: x2, ny2: offsetY, nwidthX: widthX, nheightY: offsetY - y1 };
        case "l":
            return { nx1: offsetX, ny1: y1, nx2: x2, ny2: y2, nwidthX: x2 - offsetX, nheightY: heightY };
        default:
            return null;
    }
};

export default function artboard(props) {

    let restoreArray = [] // for undo 
    let arrayIndex = -1 // array index for undo array

    const [itemNo, setItemNo] = UseState()
    const [isDrawing, setIsDrawing] = UseState(false) // to now drawing state
    const [pencil, setPencil] = UseState({
        color: 'black',
        width: '2'
    }) // for pencil style

    const [textArray, setTextArray] = UseState([]) // for storing text data
    const [textArrayIndex, setTextArrayIndex] = UseState(-1)
    const [openI, setOpenI] = UseState(false); // for opening style modal
    const [file, setFile] = UseState(null); // for image file
    const [elements, setElements] = UseState([]); // for image array
    const [drawArray, setDrawArray] = UseState([{
        color: '',
        width: '',
        x: [],
        y: []
    }]) // for storing drawing data
    const [tool, setTool] = UseState("pen"); // for selection tool
    const [action, setAction] = UseState("none"); // for action state : select or resize
    const [selectedElement, setSelectedElement] = UseState(null); // for selected image
    const [penOpen, setPenOpen] = UseState(false) // for more option in pen
    const [eraseOpen, setEraseOpen] = UseState(false) // for more option in erase
    const canvasRef = UseRef(null);
    const contextRef = UseRef(null);
    const canvasInput = UseRef(null)

    UseEffect(() => {

        setElements(props.images)
        setTextArray(props.text)
        setDrawArray(props.draw)
        // var drawStore = JSON.parse(sessionStorage.getItem('draw ' + itemNo))
        // var textStore = JSON.parse(sessionStorage.getItem('text ' + itemNo))
        // var imageStore = JSON.parse(sessionStorage.getItem('image ' + itemNo))
        // drawStore !== null ? setDrawArray(drawStore) : setDrawArray(props.draw)
        // textStore !== null ? setTextArray(textStore) : setDrawArray(props.text)
        // imageStore !== null ? setElements(imageStore) : setTextArray(props.images)

        setItemNo(props.itemno)
    }, [])

    UseEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        const context = canvas.getContext("2d")
        context.scale(2, 2);
        context.lineCap = "round";
        contextRef.current = context;

        // redrawing every image on vlue change of image
        elements.length > 0 && elements.forEach((imageElement) => {
            const { image, x1, y1, widthX, heightY } = imageElement
            Object.keys(imageElement.image).length === 0 && imageElement.image.constructor === Object ? // returns true if image object is empty
                console.log('no image') :
                contextRef.current.drawImage(image, x1, y1, widthX, heightY)
        });

        // textArray.forEach((textElement) => {
        //     const { x, y, promptText } = textElement
        //     writeText(x, y, promptText)
        // })

        // redrawing every drawing on vlue change of image
        drawArray.forEach((drawElement) => {
            const { color, width, x, y } = drawElement
            drawLibrary(color, width, x, y)
        })


    }, [elements])

    // const updateSessionStorage = (type, itemNo, store, array) => {
    //     console.log('updating store')
    //     console.log(array)
    //     array.forEach((arrayElement) => {
    //         store.push(arrayElement)
    //     })
    //     sessionStorage.setItem(type + itemNo, JSON.stringify(store))
    // }

    // constant update state of parent on update of artboard

    // draw update
    UseEffect(() => {
        props.onSaveDraw(drawArray)
    }, [drawArray])

    //text update 
    UseEffect(() => {
        props.onSaveText(textArray)
    }, [textArray])

    // image update
    UseEffect(() => {
        props.onSaveImages(elements)
    }, [elements])


    // Saving the data in session storage
    UseEffect(() => {
        var drawStore = sessionStorage.getItem('draw ' + itemNo)
        var textStore = sessionStorage.getItem('text ' + itemNo)
        var imageStore = sessionStorage.getItem('image ' + itemNo)
        // var drawStoreClone = 
        sessionStorage.setItem('draw ' + itemNo, JSON.stringify(drawArray))
        sessionStorage.setItem('text ' + itemNo, JSON.stringify(textArray))
        sessionStorage.setItem('images ' + itemNo, JSON.stringify(elements))

    }, [elements, drawArray, textArray])



    // drawing image
    const createElement = (id, x1, y1, x2, y2, type, image, widthX, heightY) => {
        clearCanvas()
        contextRef.current.drawImage(image, x1, y1, widthX, heightY);
        return { id, x1, y1, x2, y2, type, image, widthX, heightY };
    }

    // updating image
    const updateElement = (id, x1, y1, x2, y2, type, image, widthX, heightY) => {
        const updatedElement = createElement(id, x1, y1, x2, y2, type, image, widthX, heightY);
        const elementsCopy = [...elements];
        elementsCopy[id] = updatedElement;
        setElements(elementsCopy);
    };

    // drawing drawings
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
    }

    // change pen style
    UseEffect(() => {
        contextRef.current.strokeStyle = pencil.color;
        contextRef.current.lineWidth = pencil.width;
    }, [pencil])


    // start drawing or on mouse click and move
    const startDrawing = ({ nativeEvent }) => {
        // const { type } = nativeEvent
        // if ( type === 'mousedown') {
        //     const { offsetX, offsetY } = nativeEvent
        // } else {
        //     const offsetX = nativeEvent.changedTouches[0].clientX
        //     const offsetY = nativeEvent.changedTouches[0].clientY
        // }

        var offsetX
        var offsetY

        const { type } = nativeEvent
        if ( type === 'mousedown') {
            offsetX = nativeEvent.clientX
            offsetY = nativeEvent.clientY
        } else {
            offsetX = nativeEvent.changedTouches[0].clientX
            offsetY = nativeEvent.changedTouches[0].clientY
        }


        if (tool === "selection") {
            const element = getElementAtPosition(offsetX, offsetY, elements);
            if (element) {
                const clientX = offsetX - element.x1;
                const clientY = offsetY - element.y1;
                setSelectedElement({ ...element, clientX, clientY });

                if (element.position === "inside") {
                    setAction("moving");
                } else {
                    setAction("resizing");
                }
            }
        } else {
            contextRef.current.beginPath();
            contextRef.current.moveTo(offsetX, offsetY);
            setDrawArray([...drawArray, { x: [offsetX], y: [offsetY], color: pencil.color, width: pencil.width }])
            setIsDrawing(true);
        }
    };

    // on mouse move
    const draw = ({ nativeEvent }) => {

        var offsetX
        var offsetY

        const { type } = nativeEvent
        if ( type === 'mousemove') {
            offsetX = nativeEvent.clientX
            offsetY = nativeEvent.clientY
        } else {
            offsetX = nativeEvent.changedTouches[0].clientX
            offsetY = nativeEvent.changedTouches[0].clientY
        }

        var drawArrayClone = { ...drawArray }
        if (tool === "selection") {
            const element = getElementAtPosition(offsetX, offsetY, elements);
            nativeEvent.target.style.cursor = element ? cursorForPosition(element.position) : "default";
        } else if (tool === 'pen') {
            window.document.getElementById('canvas').style.cursor = "crosshair"
        }


        if (action === 'movingText') {
            window.document.getElementById('canvas').style.cursor = "grabbing"
            textArray[textArrayIndex].x = offsetX
            textArray[textArrayIndex].y = offsetY
        } else if (action === "moving") {
            const { id, x1, x2, y1, y2, type, clientX, clientY, image, widthX, heightY } = selectedElement;
            const width = x2 - x1;
            const height = y2 - y1;
            const newX1 = offsetX - clientX;
            const newY1 = offsetY - clientY;
            updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, image, widthX, heightY);
        } else if (action === "resizing") {
            const { id, type, position, x1, y1, x2, y2, image, widthX, heightY } = selectedElement;
            const { nx1, ny1, nx2, ny2, nwidthX, nheightY } = resizedCoordinates(offsetX, offsetY, position, x1, y1, x2, y2, widthX, heightY);
            updateElement(id, nx1, ny1, nx2, ny2, type, image, nwidthX, nheightY);
        }

        if (!isDrawing) {
            return;
        }
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        drawArray[drawArray.length - 1].x = [...drawArray[drawArray.length - 1].x, offsetX]
        drawArray[drawArray.length - 1].y = [...drawArray[drawArray.length - 1].y, offsetY]
        // drawArrayClone[drawArrayClone.length - 1].x = [...drawArray[drawArrayClone.length - 1].x, offsetX]
        // drawArrayClone[drawArrayClone.length - 1].y = [...drawArray[drawArrayClone.length - 1].y, offsetY]
        // setDrawArray(drawArrayClone)
    };

    // on mouse unclick or mouse up
    const finishDrawing = () => {

        const canvas = canvasRef.current;

        // if (selectedElement) {
        //     const index = selectedElement.id;
        //     const { id, type } = elements[index];
        //     if (action === "drawing" || action === "resizing") {
        //         const { x1, y1, x2, y2, image, widthX, heightY } = adjustElementCoordinates(elements[index]);
        //         updateElement(id, x1, y1, x2, y2, type, image, widthX, heightY);
        //     }
        // }

        setAction("none");
        setSelectedElement(null);
        contextRef.current.closePath();
        restoreArray.push(contextRef.current.getImageData(0, 0, canvas.width, canvas.height))
        arrayIndex += 1
        setIsDrawing(false);
    };

    // to get the position of pointer for creating text box
    const getPosition = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setTextArray([...textArray, { x: offsetX, y: offsetY }])
        setTextArrayIndex(textArrayIndex + 1)
        // const inputText = document.createElement("textarea")
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
    }

    const moveText = (e, x, y) => {
        // const { offsetX, offsetY } = nativeEvent;
        window.document.getElementById('canvas').style.cursor = "grabbing"
        const posIndex = textArray.forEach((pos, index) => {
            if (
                pos.x === x && pos.y === y
            ) {
                setTextArrayIndex(index)
            }
        })
        setAction('movingText')
    }

    const movingText = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        if (action === 'movingText') {
            window.document.getElementById('canvas').style.cursor = "grabbing"
            textArray[textArrayIndex].x = offsetX
            textArray[textArrayIndex].y = offsetY
        } else {
            window.document.getElementById('canvas').style.cursor = "text"
        }
    }

    const movedText = () => {
        setAction("text");
    }

    const writeTextInput = (e, x, y) => {
        e.preventDefault()
        var textArrayTwo = [...textArray]
        textArrayTwo.forEach((pos, index) => {
            if (
                pos.x === x && pos.y === y
            ) {
                textArrayTwo[index].promptText = e.target.value
                setTextArray(textArrayTwo)
            }
        })
    }

    const getTextBox = (e, x, y) => {
        textArray.forEach((pos, index) => {
            if (
                pos.x === x && pos.y === y
            ) {
                setTextArrayIndex(index)
            }
        })
    }

    const deleteTextInput = (e, x, y) => {

        setTextArray(textArray.filter((pos) => pos.x !== x && pos.y !== y))
    }

    // on slecting pen tool
    const selectPen = () => {
        setTool('pen')
        window.document.getElementById('canvas').style.cursor = "crosshair"

        const pencilMore = document.getElementById('pencil')
        const eraserMore = document.getElementById('eraser')
        pencilMore.style.display = "block"
        eraserMore.style.display = "none"

        setPencil({ ...pencil, color: 'black', width: 2 })
    }

    // on selecting text tool
    const selectText = () => {
        setTool('text')
        window.document.getElementById('canvas').style.cursor = "text"
    }

    // on selecting eraser tool
    const selectErase = (e) => {
        setTool('eraser')
        setPencil({ ...pencil, color: 'white', width: 20 })
        const pencilMore = document.getElementById('pencil')
        const eraserMore = document.getElementById('eraser')
        pencilMore.style.display = "none"
        eraserMore.style.display = "block"
    }

    // on selecting image tool
    const handleImage = (e) => {
        e.preventDefault()
        handleCloseI()
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            var myImage = new Image(); // Creates image object
            myImage.src = URL.createObjectURL(file); // Assigns converted image to image object
            myImage.onload = () => {
                const id = elements.length;
                const element = createElement(id, 100, 100, myImage.width * 0.5 + 100, myImage.height * 0.5 + 100, "img", myImage, myImage.width * 0.5, myImage.height * 0.5);
                setElements(prevState => [...prevState, element]);
                setSelectedElement(element);
                // contextRef.current.drawImage(myImage, 100, 100, myImage.width * 0.5, myImage.height * 0.5); // Draws the image on canvas
                // let imgData = contextRef.current.toDataURL("image/jpeg", 0.75);
            }
        }
    }

    // on selecting clear tool
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        // const removeText = document.querySelectorAll('textarea')
        // console.log(removeText)
        // if (removeText != null) {
        //     removeText.forEach(element => {
        //         canvasInput.current.removeChild(element)
        //     })
        // };
    }

    const deleteCanvas = () => {
        setTextArray([])
        setDrawArray([])
        setElements([])
    }

    // on selecting download tool
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
        const oldCanvas = canvasRef.current;

        //create a new canvas
        var newCanvas = document.createElement('canvas');
        var newContext = newCanvas.getContext('2d');

        //set dimensions
        newCanvas.width = contextRef.current.width;
        newCanvas.height = contextRef.current.height;

        //apply the old canvas to the new one
        newContext.drawImage(oldCanvas, 0, 0);

        textArray.forEach((textElement) => {
            const { x, y, promptText } = textElement
            writeText(newContext, x, y, promptText)
        })

        //return the new canvas
        const image = canvasRef.current.toDataURL('image/png');
        const blob = await (await fetch(image)).blob();
        const blobURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobURL;
        link.download = "image.png";
        link.click();
    }

    const handleChangeComplete = (color) => {
        setPencil({ ...pencil, color: color.hex })
    };

    const handleOpenI = () => setOpenI(true);
    const handleCloseI = () => setOpenI(false);


    const writeText = (newContext, x, y, text, style = {}) => {
        // const { text, x, y } = info;
        const { fontSize = 20, fontFamily = 'Arial', color = 'black', textAlign = 'left', textBaseline = 'top' } = style;

        newContext.beginPath();
        newContext.font = fontSize + 'px ' + fontFamily;
        newContext.textAlign = textAlign;
        newContext.textBaseline = textBaseline;
        newContext.fillStyle = color;
        newContext.fillText(text, x, y);
        newContext.stroke();
    }

    UseEffect(() => {
        const pencilMore = document.getElementById('pencil')
        tool === 'pen' ? pencilMore.style.display = "block" : pencilMore.style.display = "none"
    }, [tool])

    UseEffect(() => {
        document.body.onmousemove = function (e) {
            var mouse = document.getElementById('circularcursor')
            if (tool === 'eraser') {
                window.document.getElementById('canvas').style.cursor = "none"
                mouse.style.display = "block"
                mouse.style.setProperty('left', (e.clientX + window.scrollX) + 'px')
                mouse.style.setProperty('top', (e.clientY + window.scrollX + 50) + 'px')
                mouse.style.setProperty('height', (pencil.width) + 'px')
                mouse.style.setProperty('width', (pencil.width) + 'px')
            } else {
                // mouse ? mouse.style.display = "none" : ''
                mouse.style.display = "none"
            }
        }
    }, [tool, pencil.width])

    return (
        <div className="">
            <div id="circularcursor"></div>
            <div className="App" ref={canvasInput}>
                <div className="canvas-container">
                    {textArray && textArray.map((pos, index) => (
                        <div style={{ position: "absolute", left: `${pos.x}px`, top: `${pos.y}px` }} className="textInput">
                            <div className="d-flex">
                                {/* <IoMdClose
                                    style={{ position: "absolute", top: '-20px', right: '-40px', backgroundColor: 'red' }}
                                    onClick={(e) => deleteTextInput(e, pos.x, pos.y)}
                                /> */}
                                <IconButton>
                                    <IoMdMove
                                        style={{ position: "absolute" }}
                                        onClick={(e) => moveText(e, pos.x, pos.y)}
                                        className="text-move"
                                    />
                                </IconButton>
                                <IconButton>
                                    <IoMdCloseCircle
                                        style={{ position: "absolute", top: '-5px', right: '-10px' }}
                                        onClick={(e) => deleteTextInput(e, pos.x, pos.y)}
                                    />
                                </IconButton>

                            </div>
                            {/* <div>
                                <p>{pos.promptText}</p>
                            </div> */}
                            <textarea
                                id={index}
                                cols={10}
                                rows={3}
                                className="form-control"
                                style={{ position: "absolute", minWidth: '100px' }}
                                value={pos.promptText}
                                onChange={(e) => writeTextInput(e, pos.x, pos.y)}
                            // onClick={(e) => getTextBox(e, pos.x, pos.y)}
                            />
                        </div>
                    ))}
                    <canvas
                        className="drawing-board"
                        id="canvas"
                        onMouseDown={tool === 'text' ? getPosition : startDrawing}
                        onMouseMove={tool === 'text' ? movingText : draw}
                        onMouseUp={tool === 'text' ? movedText : finishDrawing}
                        onTouchStart={tool === 'text' ? getPosition : startDrawing}
                        onTouchMove={tool === 'text' ? movingText : draw}
                        onTouchEnd={tool === 'text' ? movedText : finishDrawing}
                        ref={canvasRef}
                    />
                </div>
            </div>
            <br />
            <div className="menu-bar">
                <div className="menu-item">
                    <button onClick={() => setTool("selection")} className={tool === 'selection' ? 'disabled' : ''}><FaHandPointer /></button>
                </div>
                <div className="menu-item">
                    <button>
                        <FaPenAlt onClick={selectPen} className={tool === 'pen' ? 'disabled' : ''} />
                        <div className="pen-style-open" id="pencil">
                            {penOpen ? <FaAngleDoubleLeft onClick={() => setPenOpen(!penOpen)} /> : <FaAngleDoubleRight onClick={() => setPenOpen(!penOpen)} />}
                            <div className={penOpen ? "pen-menu-open" : "pen-menu-close"}>
                                <SketchPicker
                                    color={pencil.color}
                                    onChangeComplete={handleChangeComplete}
                                />
                                <div className="pen-width">
                                    <p className="pen-width-view">{pencil.width}</p>
                                    <input
                                        id="typeinp"
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        defaultValue={pencil.width}
                                        onChange={(e) => setPencil({ ...pencil, width: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="menu-item">
                    <button
                        onClick={selectText}
                        className={tool === 'text' ? 'disabled' : ''}
                    >
                        <strong>T</strong>
                    </button>
                </div>
                <div className="menu-item">
                    <button>
                        <FaEraser onClick={selectErase} className={tool === 'eraser' ? 'disabled' : ''} />
                        <div className="erase-style-open" id="eraser">
                            {eraseOpen ? <FaAngleDoubleLeft onClick={() => setEraseOpen(!eraseOpen)} /> : <FaAngleDoubleRight onClick={() => setEraseOpen(!eraseOpen)} />}
                            <div className={eraseOpen ? "pen-menu-open" : "pen-menu-close"}>
                                <div className="pen-width">
                                    <p className="pen-width-view">{pencil.width}</p>
                                    <input
                                        id="typeinp"
                                        type="range"
                                        min="10"
                                        max="30"
                                        step="2"
                                        defaultValue={pencil.width}
                                        onChange={(e) => setPencil({ ...pencil, width: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="menu-item">
                    <button onClick={handleOpenI}><FaImages /></button>
                </div>
                <div className="menu-item">
                    <button onClick={deleteCanvas}><MdDelete /></button>
                </div>
                <div className="menu-item">
                    {/* <ComponentToPrint ref={canvasRef} /> */}
                    <button onClick={() => exportComponentAsPNG(canvasInput)}>
                        <FaDownload />
                    </button>
                </div>
            </div>
            <div className="save-btn">
                <button onClick={(e) => props.onSave(e, elements, drawArray, textArray)}>Save <FaSave /></button>
            </div>
            <Modal
                open={openI}
                onClose={handleCloseI}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <form onSubmit={handleImage} >
                        <label>Upload File</label>
                        <input
                            type="file"
                            id="file"
                            accept=".png,.jpeg,.jpg"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button type="submit">Submit</button>
                        <br />
                        {file ? (
                            <div className="book-preview">
                                <img className="preview-img" src={URL.createObjectURL(file)} alt="" width="200px" />
                                <ImCancelCircle className="sell-cancel-svg" onClick={() => setFile(null)} />
                            </div>
                        ) : (<div></div>)}
                    </form>
                </Box>
            </Modal>
        </div>
    );
}
