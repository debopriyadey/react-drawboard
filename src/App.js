import React, { useEffect, useState, useRef } from 'react'

import { IoMdCloseCircle } from 'react-icons/io'
import Artboard2 from './lib/components/artboard';
import './App.css'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { IconButton } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function App() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [textArray, setTextArray] = useState([]) // for storing text data
  const [elements, setElements] = useState([]); // for image array
  const [drawArray, setDrawArray] = useState([{
    color: "black",
    width: "2",
    x: [250, 250, 251, 252, 252, 254, 255, 257, 260, 262, 262, 263, 263, 265, 266, 266],
    y: [239, 238, 237, 237, 236, 236, 233, 233, 229, 226, 226, 226, 225, 224, 224, 223]
  }]) // for storing drawing data


  const onSave = (e, elementsClone, drawArrayClone, textArrayClone) => {
    // e.preventDefault()
    console.log('onSave in Appjs')
    setElements(elementsClone)
    setDrawArray(drawArrayClone)
    setTextArray(textArrayClone)
  }

  // functions to contant update the states 
  const onSaveDraw = (drawArrayClone) => {
    setDrawArray(drawArrayClone)
  }

  const onSaveText = (textArrayClone) => {
    setTextArray(textArrayClone)
  }

  const onSaveImages = (elementsClone) => {
    // setElements(elementsClone)
  }


  // console.log(drawArray)
  // console.log(textArray)
  // console.log(elements)

  return (
    <div className="App">
      <div id="circularcursorApp"></div>

      <div className="artboard-btn-container">
        <Button onClick={handleOpen} variant="contained" className="artboard-btn">Item Design</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <IconButton className="artboard-close-btn">
              <IoMdCloseCircle onClick={handleClose} />
            </IconButton>
            <div className="m-3">
              {/* <div className="row">
                <ItemDetails />
              </div> */}
              <div className="row">
                <div className="col-12">
                  <Artboard2
                    images={elements}
                    text={textArray}
                    draw={drawArray}
                    itemno={'4'}
                    onSave={(e, elementsClone, drawArrayClone, textArrayClone) => onSave(e, elementsClone, drawArrayClone, textArrayClone)}
                    onSaveDraw={(drawArrayClone) => onSaveDraw(drawArrayClone)}
                    onSaveText={(textArrayClone) => onSaveText(textArrayClone)}
                    onSaveImages={(elementsClone) => onSaveImages(elementsClone)}
                  />
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default App;