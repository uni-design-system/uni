import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { ColorSwatch } from '../color-swatch/color-swatch.component';
export const ColorPicker = ({ imageUrl, imageWidth, imageHeight, sampleSize = 41 }) => {
    const canvasRef = useRef(null);
    const [pixelColor, setPixelColor] = useState({ red: 0, green: 0, blue: 0, alpha: 1 });
    const [averageColor, setAverageColor] = useState({ red: 0, green: 0, blue: 0, alpha: 1 });
    let canvas;
    let ctx;
    let img;
    useEffect(() => {
        canvas = canvasRef.current;
        if (canvas) {
            ctx = canvas.getContext('2d');
            canvas.width = imageWidth;
            canvas.style.width = `${imageWidth}px`;
            canvas.height = imageHeight;
            canvas.style.height = `${imageHeight}px`;
        }
        img = document.createElement('img');
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        //once the image is loaded, add it to the canvas
        img.onload = (ev) => {
            ctx?.drawImage(img, 0, 0);
            //call the context.getImageData method to get the array of [r,g,b,a] values
            let imgDataObj = ctx?.getImageData(0, 0, canvas?.width || 0, canvas?.height || 0);
            const data = imgDataObj?.data; //data prop is an array
            if (!!data && !!canvas) {
                canvas?.addEventListener('mousemove', (ev) => {
                    getPixel(data, ev);
                });
            }
            // canvas?.addEventListener('click', addBox);
        };
    }, []);
    const getPixel = (data, ev) => {
        if (!canvas)
            return;
        //as the mouse moves around the image
        // let canvas = ev.target;
        let cols = canvas.width;
        // let rows = canvas.height;
        let { offsetX, offsetY } = ev;
        //call the method to get the r,g,b,a values for current pixel
        let c = getPixelColor(data, cols, offsetY, offsetX);
        //save the string to use elsewhere
        // pixel = clr;
        setPixelColor(c);
        //now get the average of the surrounding pixel colours
        setAverageColor(getAverage(data, ev));
    };
    const getAverage = (data, ev) => {
        if (!ctx)
            return { red: 0, green: 0, blue: 0, alpha: 1 };
        //create a 41px by 41px average colour square
        //replace everything in the canvas with the original image
        // let canvas = ev.target;
        let cols = canvas?.width || 0;
        let rows = canvas?.height || 0;
        //remove the current contents of the canvas to draw the image and box again
        ctx.clearRect(0, 0, cols, rows);
        //add the image from memory
        ctx.drawImage(img, 0, 0);
        let { offsetX, offsetY } = ev;
        const inset = Math.round(sampleSize / 2);
        //inset by 20px as our workable range
        offsetX = Math.min(offsetX, cols - inset);
        offsetX = Math.max(inset, offsetX);
        offsetY = Math.min(offsetY, rows - inset);
        offsetY = Math.max(offsetY, inset);
        //create a 41 x 41 pixel square for the average
        let reds = 0; //total for all the red values in the 41x41 square
        let greens = 0;
        let blues = 0;
        //for anything in the range (x-20, y-20) to (x+20, y+20)
        for (let x = -1 * inset; x <= inset; x++) {
            for (let y = -1 * inset; y <= inset; y++) {
                let c = getPixelColor(data, cols, offsetY + y, offsetX + x);
                reds += c.red;
                greens += c.green;
                blues += c.blue;
            }
        }
        let nums = inset * inset * 4; //total number of pixels in the box
        let red = Math.round(reds / nums);
        let green = Math.round(greens / nums);
        let blue = Math.round(blues / nums);
        //now draw an overlaying square of that colour
        //make the square twice as big as the sample area
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.strokeStyle = 'solid 2px #FFFFFF';
        ctx.strokeRect(offsetX - inset, offsetY - inset, inset * 2, inset * 2);
        ctx.fillRect(offsetX - inset, offsetY - inset, inset * 2, inset * 2);
        return { red, green, blue, alpha: 1 };
    };
    const getPixelColor = (data, cols, x, y) => {
        let pixel = cols * x + y;
        let arrayPos = pixel * 4;
        return {
            red: data[arrayPos],
            green: data[arrayPos + 1],
            blue: data[arrayPos + 2],
            alpha: data[arrayPos + 3],
        };
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("div", { style: { marginBottom: 16 }, children: _jsx("canvas", { ref: canvasRef }) }), _jsx(ColorSwatch, { rgba: pixelColor, children: "Pixel Color" }), _jsx(ColorSwatch, { rgba: averageColor, children: "Average Color" })] }));
};
