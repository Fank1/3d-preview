import { stickers } from '/svg-resources/sticker-paths.js';
import { glitterSVG } from '/svg-resources/glitter.js';
import { crackedIceMaskContent } from '/svg-resources/cracked-ice.js';

//const glitterSVG = require('/svg-resources/glitter.js');

import '/style/reset.css';
import '/style/main.scss';

document.querySelector('#new-glitter-pattern').innerHTML = glitterSVG;
document.querySelector('#cracked-mask').innerHTML = crackedIceMaskContent;

//--------Global variables-----------
let posX = 0;
let posY = 0;
// relX and relY is the pointer position (-1 to 1) relative to screen center
let relX = 0;
let relY = 0;

// used for mouse speed
let totalX = 0;
let totalY = 0;
let moveX = 0;
let moveY = 0;
let mouseSpeed = 0;

let angleDeg = 0;
let inspectMode = false;
let patternScale = 1;
let laminateScale = 1;
const shadowOffset = 30;
let currentMaterial;
let currentLaminate;
let hasMetallic = false;
let currentSticker;
const shinyReflectionImageUrl =
  'https://assets.codepen.io/626120/escaltor-shine.jpg';
const matteReflectionImageUrl =
  'https://assets.codepen.io/626120/escaltor-blur-20.jpg';
let screenCenterX = window.innerWidth / 2;
let screenCenterY = window.innerHeight / 2;
let printWidth = stickers[0].width;
let printHeight = stickers[0].height;

//controls how large the gloss image gets, 1 is the same as print width/height
const glossExpansionWidthRatio = 4;
const glossExpansionHeightRatio = 1.5;

// ------------ DOM selectors --------
const domRoot = document.querySelector(':root');
const domWrapper = document.querySelector('.wrapper');
const domCanvas = document.querySelector('#canvas');
const domBasePlate = document.querySelector('#baseplate');
const domTurbFilter = document.querySelector('#displacementFilter');
const domBasePlateMaskSVG = document.querySelector('#baseplatemask svg');
const domFixedSizeLayers = document.querySelectorAll('.fixed-size');
const domMaskedLayers = document.querySelectorAll('.is-masked');

const domWhiteLayer = document.querySelector('#white-layer');
const domPrint = document.querySelector('#print');
const domHoloGraphic = document.querySelector('#holographic');
const domLaminate = document.querySelector('#laminate');

//------------- Prismatic selectors -------------

const domPrismPattern = document.querySelector('#prism-pattern');
const domPrismImg = document.querySelector('#prism-img');
const domPrismImgAddition = document.querySelector('#prism-img-addition');
const domPrismLayer = document.querySelector('#prismatic');

//---------- Glitter selectors and variables --------------------

const domGlitterPattern = document.querySelector('#new-glitter-pattern');

let rainbowImage = document.createElement('image');
rainbowImage.setAttribute(
  'href',
  `https://assets.codepen.io/626120/square-holo.jpg`
);
rainbowImage.setAttribute('width', `200`);
rainbowImage.setAttribute('height', `200`);
rainbowImage.setAttribute('preserveAspectRatio', `xMinYmin meet`);

domGlitterPattern.append(rainbowImage);

// ------- Brushed selectors -------------------------

const domBrushedPattern = document.querySelector('#brushed-pattern');
//const domBrushedImg = document.querySelector("#brushed-img");

// ------------- Recycled selectors ------------------------

const domRecycledPattern = document.querySelector('#recycled-pattern');

// ------------- Reflection selectors ------------------------

const domMetallic = document.querySelector('#metallic');

//-------------- Pixie selectors --------------------------

const domPixiePattern = document.querySelector('#pixie-pattern');
const domPixieImg = document.querySelector('#pixie-pattern image');
const domPixieMaskLayers = document.querySelectorAll('.pixie-mask-layer');
const numOfPixieMaskLayers = domPixieMaskLayers.length;

//-------- Cracked Ice selectors -----------------

const domCrackedHolder = document.querySelector('#cracked');
const domCrackedPattern = document.querySelector('#cracked-pattern');
const domShards = document.querySelectorAll('#cracked-mask svg path');

//---------- Clear mask selectors ----------------------

const domClearMask = document.querySelector('#white-mask-layer');
const domClearMaskImg = document.querySelector('#white-mask-layer');

// -------- Debug / testing selectors --------------------

const debugLaminateGloss = document.querySelector('.laminate.glossy');
const debugLaminateMatte = document.querySelector('.laminate.matte');
const debugLaminateIce = document.querySelector('.laminate.ice');

//------- Centering and sizing functions ---------------

function setViewBoxes() {
  screenCenterX = window.innerWidth / 2;
  screenCenterY = window.innerHeight / 2;

  //sets the parent SVG to fullscreen viewBox
  domCanvas.setAttribute(
    'viewBox',
    '0 0 ' + window.innerWidth + ' ' + window.innerHeight
  );

  //sets the baseplate mask svg viewbox to printsize - couldn't get the mask to position itself without a SVG container
  domBasePlateMaskSVG.setAttribute(
    'viewBox',
    '0 0 ' + printWidth + ' ' + printHeight
  );
}

function setPrintSizeAndCenter() {
  //sets print size according to size variables and center the print on the svg canvas
  domPrint.setAttribute(
    'transform',
    `translate(${screenCenterX - printWidth / 2} ${
      screenCenterY - printHeight / 2
    })`
  );
  domPrint.setAttribute('width', printWidth);
  domPrint.setAttribute('height', printHeight);

  //centers and sizes the turbulence filter

  domTurbFilter.setAttribute('x', screenCenterX - printWidth / 2);
  domTurbFilter.setAttribute('y', screenCenterY - printHeight / 2);

  domTurbFilter.setAttribute('width', printWidth);
  domTurbFilter.setAttribute('height', printHeight);

  //centers and sizes the white layer

  domWhiteLayer.setAttribute(
    'transform',
    `translate(${screenCenterX - printWidth / 2} ${
      screenCenterY - printHeight / 2
    })`
  );
  domWhiteLayer.setAttribute('width', printWidth);
  domWhiteLayer.setAttribute('height', printHeight);

  domClearMaskImg.setAttribute('width', printWidth);
  domClearMaskImg.setAttribute('height', printHeight);

  //centers the baseplate
  domBasePlate.setAttribute(
    'transform',
    `translate(${screenCenterX - printWidth / 2} ${
      screenCenterY - printHeight / 2
    })`
  );

  //this makes sure the gloss image covers more than the whole print and has movement space
  domLaminate.setAttribute('width', printWidth * glossExpansionWidthRatio);
  domLaminate.setAttribute('height', printHeight * glossExpansionHeightRatio);

  //centering the laminate layer in relation to screen and its own size
  domLaminate.setAttribute(
    'x',
    screenCenterX - (printWidth * glossExpansionWidthRatio) / 2
  );
  domLaminate.setAttribute(
    'y',
    screenCenterY - (printHeight * glossExpansionHeightRatio) / 2
  );

  //centering the metallic layer in relation to screen and its own size

  domMetallic.setAttribute('width', printWidth * glossExpansionWidthRatio);
  domMetallic.setAttribute('height', printHeight * glossExpansionHeightRatio);
  domMetallic.setAttribute(
    'x',
    screenCenterX - (printWidth * glossExpansionWidthRatio) / 2
  );
  domMetallic.setAttribute(
    'y',
    screenCenterY - (printHeight * glossExpansionHeightRatio) / 2
  );

  //set the size and center of holographic effect
  domHoloGraphic.setAttribute('x', screenCenterX - 2000 / 2);
  domHoloGraphic.setAttribute('y', screenCenterY - 2000 / 2);
  domHoloGraphic.setAttribute('width', 2000);
  domHoloGraphic.setAttribute('height', 2000);

  //set the size of the masks SVG container to match the print
  domBasePlateMaskSVG.setAttribute('width', printWidth);
  domBasePlateMaskSVG.setAttribute('height', printHeight);

  //the masks position is relative to the image (#shine):s dimensions, so it needs to be centered
  domBasePlateMaskSVG.setAttribute('x', screenCenterX - printWidth / 2);
  domBasePlateMaskSVG.setAttribute('y', screenCenterY - printHeight / 2);
}

function centerAndSizeStaticLayers() {
  for (var i = 0; i < domFixedSizeLayers.length; i++) {
    domFixedSizeLayers[i].setAttribute('width', printWidth);
    domFixedSizeLayers[i].setAttribute('height', printHeight);
    domFixedSizeLayers[i].setAttribute('x', screenCenterX - printWidth / 2);
    domFixedSizeLayers[i].setAttribute('y', screenCenterY - printHeight / 2);
  }
}

function setClearMask() {
  domClearMask.setAttribute('width', printWidth);
  domClearMask.setAttribute('height', printHeight);
}

function addBaseplateMasking() {
  for (var i = 0; i < domMaskedLayers.length; i++) {
    domMaskedLayers[i].setAttribute('mask', 'url(#baseplatemask)');
  }
}

function setFirstSticker() {
  $('#print').attr('href', stickers[0].printUrl);
  $('#white-layer').attr('href', stickers[0].printWhiteLayerUrl);
  $('#baseplate').attr('d', stickers[0].baseplate);
  $('#baseplatemask svg path').attr('d', stickers[0].baseplate);
  currentSticker = stickers[0];
}

// runs the sizing and centering functions
function setTheScene() {
  setViewBoxes();
  addBaseplateMasking();
  setPrintSizeAndCenter();
  centerAndSizeStaticLayers();
  //randomizes shards shown
  moveCracked();
}

//--------Interactions -------------------

addEventListener('resize', (event) => {
  setTheScene();
});

document.addEventListener('mousemove', (e) => {
  updateCanvas(e);
  //mouse speed
});

//not sure this one works
document.addEventListener('touchmove', (e) => {
  updateCanvas(e);
});

domBasePlate.addEventListener('click', function () {
  inspectMode = !inspectMode;
  domWrapper.classList.toggle('inspectMode');
  //reset canvas rotation and shadow when deactivated
  if (!inspectMode) {
    adjustShadow('reset');
    moveLaminate('reset');
    domRoot.style.setProperty('--posX', 0);
    domRoot.style.setProperty('--posY', 0);
  }
});

// ---------- general visual updater ----------------

function updateCanvas(e) {
  if (inspectMode) {
    requestAnimationFrame(() => {
      // updating global pointer position
      posX = e.pageX;
      posY = e.pageY;
      //updating relative pointer position
      relX = (posX / window.innerWidth - 0.5).toFixed(3);
      relY = (posY / window.innerHeight - 0.5).toFixed(3);
      // getting angle value from pointer position and screen center
      let angle = Math.atan2(posY - screenCenterY, posX - screenCenterX);
      angleDeg = (angle * 180) / Math.PI + 90;
      if (angleDeg < 0) {
        angleDeg = angleDeg + 360;
      }
      //updating CSS variables
      domRoot.style.setProperty('--posX', relX);
      domRoot.style.setProperty('--posY', -relY);
      adjustShadow('move');
      moveLaminate();
      if (currentLaminate === 'cracked') {
        moveCracked();
      }
      if (
        currentMaterial === 'holographic' ||
        currentMaterial === 'glitter' ||
        currentMaterial === 'pixie'
      ) {
        moveHolographic();
      }
      if (currentMaterial === 'prismatic') {
        movePrismatic();
      }
      if (currentMaterial === 'glitter') {
        moveGlitter();
      }
      if (currentMaterial === 'pixie') {
        movePixie();
      }
      if (hasMetallic) {
        moveMetallic();
      }
    });
  }
}

// -------- Visual manipulation functions -------------

function moveLaminate(type) {
  if (type === 'reset') {
    domLaminate.setAttribute(
      'x',
      screenCenterX - (printWidth * glossExpansionWidthRatio) / 2
    );
    domLaminate.setAttribute(
      'y',
      screenCenterY - (printHeight * glossExpansionHeightRatio) / 2
    );
  } else {
    //this moves the baseplatemask image
    domLaminate.setAttribute(
      'x',
      screenCenterX - (printWidth * glossExpansionWidthRatio) / 2 + relX * 200
    );
    domLaminate.setAttribute(
      'y',
      screenCenterY - (printHeight * glossExpansionHeightRatio) / 2 + relY * 200
    );
  }
}

//------- METALLIC ---------------- //

function moveMetallic(type) {
  if (type === 'reset') {
    domMetallic.setAttribute(
      'x',
      screenCenterX - (printWidth * glossExpansionWidthRatio) / 2
    );
    domMetallic.setAttribute(
      'y',
      screenCenterY - (printHeight * glossExpansionHeightRatio) / 2
    );
  } else {
    domMetallic.setAttribute(
      'x',
      screenCenterX - (printWidth * glossExpansionWidthRatio) / 2 + relX * 200
    );
    domMetallic.setAttribute(
      'y',
      screenCenterY - (printHeight * glossExpansionHeightRatio) / 2 + relY * 200
    );
  }
}

//----------SHADOW --------------//

function adjustShadow(type) {
  if (type === 'reset') {
    domRoot.style.setProperty('--shadow', '0 0 15px rgba(0,0,0,0.15)');
  } else if (type === 'move') {
    let shadowValues = `${(relX * shadowOffset * 15).toFixed(1)}px ${(
      relY *
      shadowOffset *
      8
    ).toFixed(1)}px  15px rgba(0,0,30,0.12)`;
    domRoot.style.setProperty('--shadow', shadowValues);
  }
}

// ---------- PRISMATIC ------------- //

let angleChange = 0;

function movePrismatic() {
  angleChange = relY * 360 + relX * 120;

  domPrismImg.setAttribute(
    'transform',
    `rotate(${angleChange} 0 0) translate(-20 -20)`
  );
  domPrismImg.style.opacity = Math.abs(relX + 0.6);
  domPrismImgAddition.setAttribute(
    'transform',
    `rotate(${angleChange} 0 0) translate(-20 -20)`
  );
  domPrismImgAddition.style.opacity = Math.abs(relX);
  domPrismLayer.style.filter = `hue-rotate(${angleChange}deg)`;
}

//-------------- GLITTER ------------------------//

const numOfGlitterRows = 29;
let glitterCurrentRow;
let prevGlitterLayer;
let currentGlitterLayer;
let nextGlitterLayer;
let diff;
let resultDiff;

const allGlitterDotsObject = document.querySelectorAll(
  '#new-glitter-pattern path'
);
const glitterRowArray = document.querySelectorAll('#new-glitter-pattern .row');

function resetGlitterGots() {
  for (let i = 0; i < glitterRowArray.length; i++) {
    let currentPaths = glitterRowArray[i];
    let allPaths = currentPaths.querySelectorAll('path');
  }
}

function glitterColorLayer(positionArray, color) {
  for (let i = 0; i < positionArray.length; i++) {
    allGlitterDotsObject[positionArray[i]].setAttribute('fill', color);
  }
}

function setRandomGlitterLayer(position, amount) {
  if (position === 'prev') {
    let tempArray = [];
    for (let i = 0; i < amount; i++) {
      tempArray.push(Math.floor(Math.random() * allGlitterDotsObject.length));
    }
    prevGlitterLayer = tempArray;
  } else if (position === 'current') {
    let tempArray = [];
    for (let i = 0; i < amount; i++) {
      tempArray.push(Math.floor(Math.random() * allGlitterDotsObject.length));
    }
    currentGlitterLayer = tempArray;
  } else if (position === 'next') {
    let tempArray = [];
    for (let i = 0; i < amount; i++) {
      tempArray.push(Math.floor(Math.random() * allGlitterDotsObject.length));
    }
    nextGlitterLayer = tempArray;
  } else if (position === 'all') {
    let tempArrayPrev = [];
    let tempArrayCurrent = [];
    let tempArrayNext = [];
    for (let i = 0; i < amount; i++) {
      tempArrayPrev.push(
        Math.floor(Math.random() * allGlitterDotsObject.length)
      );
    }
    for (let i = 0; i < amount; i++) {
      tempArrayCurrent.push(
        Math.floor(Math.random() * allGlitterDotsObject.length)
      );
    }
    for (let i = 0; i < amount; i++) {
      tempArrayNext.push(
        Math.floor(Math.random() * allGlitterDotsObject.length)
      );
    }
    prevGlitterLayer = tempArrayPrev;
    currentGlitterLayer = tempArrayCurrent;
    nextGlitterLayer = tempArrayNext;
  }
}

//------ FADES VALUES IN AND OUT (for glitter) ------------- //

function valueSmoother(x, shift) {
  let result =
    2 *
    Math.sin(Math.PI * x + (shift * 0.33 * Math.PI) / 3) *
    Math.cos(Math.PI * x + (shift * 0.33 * Math.PI) / 3);
  if (result < 0) {
    result = 0;
  } else {
    result = (result * 100).toFixed(1);
  }
  return result;
}

//SETTING UP FOR GLITTER EFFECT --------- //

setRandomGlitterLayer('all', 300);
glitterColorLayer(prevGlitterLayer, '#000');
glitterColorLayer(currentGlitterLayer, '#000');
glitterColorLayer(nextGlitterLayer, '#000');

// --------- GLITTER EFFECT --------- //

function moveGlitter(type) {
  glitterCurrentRow = parseInt(relY * numOfGlitterRows + 1);
  diff = parseFloat(relY * numOfGlitterRows + 1 - glitterCurrentRow);
  resetGlitterGots();
  domRoot.style.setProperty(
    '--hueshift',
    Math.floor(relY * 360 + relX * 360) + 'deg'
  );
  if (diff >= 0.5) {
    resultDiff = 1 - diff + 0.1;
  } else {
    resultDiff = diff + 0.1;
  }
  let testDotIndexPrev = Math.floor(Math.abs(relY * prevGlitterLayer.length));
  let testDotIndexCurrent = Math.floor(
    Math.abs(relY * currentGlitterLayer.length)
  );
  let testDotIndexNext = Math.floor(Math.abs(relY * nextGlitterLayer.length));
  if (allGlitterDotsObject) {
    allGlitterDotsObject[prevGlitterLayer[testDotIndexPrev]].setAttribute(
      'fill',
      `hsl(${720 * relX + 720 * relY}, ${relY * 50 + 50}%,${
        valueSmoother(relX * relX + relY * relY, 3) * resultDiff
      }%)`
    );
    allGlitterDotsObject[currentGlitterLayer[testDotIndexCurrent]].setAttribute(
      'fill',
      `hsl(${400 * relX + 400 * relY}, ${relY * 50 + 50}%,${
        valueSmoother(relX * relX + relY * relY, 2) * resultDiff
      }%)`
    );
    allGlitterDotsObject[nextGlitterLayer[testDotIndexNext]].setAttribute(
      'fill',
      `hsl(${100 * relX + 100 * relY}, ${relY * 50 + 50}%,${
        valueSmoother(relX * relX + relY * relY, 1) * resultDiff
      }%)`
    );
  }
  let currentGlitterDots = glitterRowArray[glitterCurrentRow];
  if (type === 'reset') {
    console.log('yup');
    allGlitterDotsObject[prevGlitterLayer[11]].setAttribute(
      'fill',
      `hsl(${720 * 1 + 720 * 1}, ${1 * 30 + 50}%,${90}%)`
    );
    allGlitterDotsObject[currentGlitterLayer[5]].setAttribute(
      'fill',
      `hsl(${400 * 0.5 + 400 * 1}, ${1 * 10 + 50}%,${90}%)`
    );
    allGlitterDotsObject[nextGlitterLayer[4]].setAttribute(
      'fill',
      `hsl(${100 * 0.5 + 100 * 1}, ${1 * 50 + 50}%,${50}%)`
    );
  }
}

//--------------- PIXIE DUST ----------------------- //

let pixieDebounce;
let currentPixieLayerIndex;

function movePixie() {
  if (pixieDebounce) {
    return;
  }
  domPixieImg.style.filter = `hue-rotate(${relX * 4}turn)`;
  pixieDebounce = true;
  setTimeout(() => {
    let shiftVal = 0;
    shiftVal = Math.random();
    currentPixieLayerIndex = Math.round((numOfPixieMaskLayers - 1) * shiftVal);
    for (let i = 0; i < numOfPixieMaskLayers; i++) {
      if (i === currentPixieLayerIndex) {
        domPixieMaskLayers[i].style.opacity = 1;
      } else {
        domPixieMaskLayers[i].style.opacity = 0.1;
      }
    }
    pixieDebounce = false;
  }, 90);
}

//--------------- HOLOGRAPHIC ----------------------- //

// this moves the opposite direction
function moveHolographic() {
  domHoloGraphic.setAttribute('x', screenCenterX - 1500 / 2 + relX * 1300 * -1);
  domHoloGraphic.setAttribute('y', screenCenterY - 1500 / 2 + relY * 1300 * -1);
}

//--------------- CRACKED ICE LAMINATE ----------------------- //

let crackedDebounce;

function moveCracked() {
  if (crackedDebounce) {
    return;
  }
  const amountOfShards = 13;
  domCrackedHolder.style.filter = `hue-rotate(${angleDeg / 4}deg)`;
  crackedDebounce = true;
  setTimeout(() => {
    for (let i = 0; i < domShards.length; i++) {
      domShards[i].style.opacity = 0.1;
    }
    for (let j = 0; j <= amountOfShards; j++) {
      let random = Math.floor(Math.random() * domShards.length);
      domShards[random].style.opacity = 1;
    }
    crackedDebounce = false;
  }, 180);
}

//--------------- DEBUG / TESTING PURPOSES (jquery - so soory) ---------

//changing the pattern scale---------------

function setPatternScale() {
  domPrismPattern.setAttribute('patternTransform', `scale(${patternScale})`);
  domGlitterPattern.setAttribute('patternTransform', `scale(${patternScale})`);
  domRecycledPattern.setAttribute('patternTransform', `scale(${patternScale})`);
  domPixiePattern.setAttribute('patternTransform', `scale(${patternScale})`);
  domBrushedPattern.setAttribute('patternTransform', `scale(${patternScale})`);
  domCrackedPattern.setAttribute('patternTransform', `scale(${patternScale})`);
  domGlitterPattern.setAttribute('patternTransform', `scale(${patternScale})`);
}

function setLaminateScale() {
  domCrackedPattern.setAttribute('patternTransform', `scale(${laminateScale})`);
}

$(document).on('input', '#laminate-scale', function () {
  laminateScale = $(this).val();
  setLaminateScale();
});

$(document).on('input', '#scale', function () {
  patternScale = $(this).val();
  setPatternScale();
});

//toggling layers ----------------------------------
$('.label').click(function () {
  $(this).toggleClass('is-off');
  $(this).next('.option-group').toggleClass('is-off');
  if ($(this).hasClass('print')) {
    $('.layer#print').toggleClass('is-off');
  } else if ($(this).hasClass('laminate')) {
    $('.layer#laminate').toggleClass('is-off');
  } else if ($(this).hasClass('material')) {
    $('.layer.material').toggleClass('is-off');
  } else if ($(this).hasClass('white-layer')) {
    $('.wrapper').toggleClass('has-white-layer');
    $('.layer#white-layer').toggleClass('is-off');
  } else if ($(this).hasClass('shadow')) {
    $('.wrapper').toggleClass('has-shadow');
  } else if ($(this).hasClass('metallic-toggle')) {
    $('.wrapper').toggleClass('has-metallic');
    $('#metallic').toggleClass('is-off');
    $('#metallic-opacity').toggleClass('is-disabled');
    hasMetallic = !hasMetallic;
  }
});

//toggling laminate features ---------------------

$('.checkbox').click(function () {
  if ($(this).hasClass('laminateMaskToggle')) {
    if ($(this).hasClass('is-on')) {
      $('#laminate').attr('mask', '');
    } else {
      $('#laminate').attr('mask', 'url(#baseplatemask)');
    }
  } else if ($(this).hasClass('blendModeToggle')) {
    if ($(this).hasClass('is-on')) {
      $('#laminate').css('mix-blend-mode', 'normal');
    } else {
      $('#laminate').css('mix-blend-mode', 'multiply');
    }
  } else if ($(this).hasClass('turbulenceToggle')) {
    if ($(this).hasClass('is-on')) {
      $('#laminate').css('filter', 'none');
    } else {
      $('#laminate').css('filter', '');
    }
  } else if ($(this).hasClass('opacityToggle')) {
    if ($(this).hasClass('is-on')) {
      $('#laminate').css('opacity', '1');
    } else {
      $('#laminate').css('opacity', '');
    }
  } else if ($(this).hasClass('materialTurbulenceToggle')) {
    $('body').toggleClass('layer-turbulence-is-off');
  }
  $(this).toggleClass('is-on');
});

//changing stickers -------------------

$(document).on('click', '.sticker', function () {
  $('.sticker').removeClass('is-active');
  $(this).addClass('is-active');
  let selectedIndex = $(this).index();
  console.log(selectedIndex);
  currentSticker = stickers[selectedIndex];
  //change print
  $('#print').attr('href', currentSticker.printUrl);
  //change baseplate
  $('#baseplate').attr('d', currentSticker.baseplate);
  $('#baseplatemask path').attr('d', currentSticker.baseplate);
  $('#white-layer').attr('href', currentSticker.printWhiteLayerUrl);
  $('#white-mask-layer').attr('href', currentSticker.printWhiteLayerUrl);
  $('#combined-mask-layer image').attr(
    'href',
    currentSticker.printWhiteLayerUrl
  );
  $('#combined-white-mask image').attr(
    'href',
    currentSticker.printWhiteLayerUrl
  );
  //change size
  printWidth = currentSticker.width;
  printHeight = currentSticker.height;
  setTheScene();
});

//changing laminates

$('.option.laminate').click(function () {
  currentLaminate = '';
  $('#laminate-scaler').removeClass('is-shown');
  $('.option.laminate').removeClass('is-on');
  $('#cracked').addClass('is-off');
  $('.wrapper').removeClass('has-matte has-cracked');
  $('#laminate-opacity').removeClass('is-disabled');
  $(this).addClass('is-on');
  if ($(this).hasClass('gloss')) {
    $('.wrapper').addClass('has-gloss');
    $('#laminate').attr('href', shinyReflectionImageUrl);
    $('#metallic').attr('href', shinyReflectionImageUrl);
  } else if ($(this).hasClass('matte')) {
    $('.wrapper').addClass('has-matte');
    $('#laminate-opacity').addClass('is-disabled');
    $('#laminate').attr('href', matteReflectionImageUrl);
    $('#metallic').attr('href', matteReflectionImageUrl);
  } else if ($(this).hasClass('cracked')) {
    $('#cracked').removeClass('is-off');
    $('#laminate-scaler').addClass('is-shown');
    $('.wrapper').addClass('has-cracked');
    $();
    currentLaminate = 'cracked';
  }
});

//--- changing laminate opacity --------

$(document).on('input', '#laminate-opacity-slider', function () {
  let currentVal = $(this).val();
  $('#laminate-opacity span').text(currentVal);
  $('#laminate').css('opacity', currentVal);
});

$('#laminate-opacity .reset').click(function () {
  $('#laminate-opacity-slider').val(0.09);
  $('#laminate-opacity span').text('0.09');
  $('#laminate').css('opacity', 0.09);
});

//--- changing metallic opacity --------

$(document).on('input', '#metallic-opacity-slider', function () {
  let currentVal = $(this).val();
  $('#metallic-opacity span').text(currentVal);
  $('#metallic').css('opacity', currentVal);
});

$('#metallic-opacity .reset').click(function () {
  $('#metallic-opacity-slider').val(0.3);
  $('#metallic-opacity span').text('0.3');
  $('#metallic').css('opacity', 0.3);
});

//--------changing materials -----

$('.option.material').click(function () {
  currentMaterial = $(this).data('type');
  $('.option.material').removeClass('is-on');
  $('#pattern-scaler').removeClass('is-shown');
  $('#laminate').attr(
    'href',
    'https://assets.codepen.io/626120/escaltor-shine.jpg'
  );
  // ----- just resets -------
  $('.wrapper').removeClass(
    'has-vinyl has-prismatic has-holographic has-glitter has-recycled has-pixie has-brushed has-metallic has-mirror has-clear'
  );
  $('.wrapper').addClass(`has-${currentMaterial}`);
  $('.material').addClass('is-off');
  $(`#${currentMaterial}`).removeClass('is-off');
  hasMetallic = false;
  $('.metallic-toggle').addClass('is-off');
  $('body').removeClass('has-clear');
  $('#baseplate').removeAttr('mask');
  $('#print').removeAttr('mask');
  $('#metallic-opacity').addClass('is-disabled');
  $('#extra-recycled').addClass('is-off');

  //----end of resets ------------

  if ($(this).hasClass('vinyl')) {
    //
  } else if ($(this).hasClass('holographic')) {
    //
  } else if ($(this).hasClass('prismatic')) {
    $('#pattern-scaler').addClass('is-shown');
  } else if ($(this).hasClass('glitter')) {
    hasMetallic = true;
    $('.wrapper').addClass('has-metallic');
    $('#metallic').removeClass('is-off');
    $('.metallic-toggle').removeClass('is-off');
    $('#pattern-scaler').addClass('is-shown');
    $('#metallic-opacity').removeClass('is-disabled');
    moveGlitter('reset');
  } else if ($(this).hasClass('recycled')) {
    $('#pattern-scaler').addClass('is-shown');
    $('#extra-recycled').removeClass('is-off');
  } else if ($(this).hasClass('pixie')) {
    hasMetallic = true;
    $('#pattern-scaler').addClass('is-shown');
    $('.wrapper').addClass('has-metallic');
    $('#metallic').removeClass('is-off');
    $('#metallic-opacity').removeClass('is-disabled');
    $('.metallic-toggle').removeClass('is-off');
  } else if ($(this).hasClass('brushed')) {
    $('.wrapper').addClass('has-metallic');
    $('#metallic').removeClass('is-off');
    $('.metallic-toggle').removeClass('is-off');
    $('#metallic-opacity').removeClass('is-disabled');
    hasMetallic = true;
    $('#pattern-scaler').addClass('is-shown');
  } else if ($(this).hasClass('mirror')) {
    $('.wrapper').addClass('has-metallic');
    $('#metallic').removeClass('is-off');
    $('.metallic-toggle').removeClass('is-off');
    $('#metallic-opacity').removeClass('is-disabled');
    hasMetallic = true;
  } else if ($(this).hasClass('clear')) {
    $('#print').attr('mask', 'url(#clear-mask)');
    $('#baseplate').attr('mask', 'url(#clear-mask)');
    $('#white-mask-layer').attr('href', currentSticker.printWhiteLayerUrl);
    $('body').addClass('has-clear');
  }
  $(this).addClass('is-on');
});

$('.hamburger').click(function () {
  $('.sidebar').toggleClass('is-open');
});

$('.modal-button').click(function () {
  $('body').toggleClass('add-motive');
});

$('.cancel').click(function () {
  $('body').removeClass('add-motive');
});

let addStickerIsFilledIn = false;

function checkAddSticker() {
  let imageUrl = false;
  let imageHeight = false;
  let imageWidth = false;
  let baseplateCode = false;
  if ($('#image-url').val().length > 1) {
    imageUrl = true;
  } else {
    imageUrl = false;
  }
  if ($('#image-height').val() > 1) {
    imageHeight = true;
  } else {
    imageHeight = false;
  }
  if ($('#image-width').val() > 1) {
    imageWidth = true;
  } else {
    imageWidth = false;
  }
  if ($('#baseplate-code').val().length > 1) {
    baseplateCode = true;
  } else {
    baseplateCode = false;
  }
  if (imageUrl && imageHeight && imageWidth && baseplateCode) {
    $('.add').removeClass('disabled');
    addStickerIsFilledIn = true;
  } else {
    $('.add').addClass('disabled');
    addStickerIsFilledIn = false;
  }
}

$('#image-url, #image-height, #image-width, #baseplate-code').on(
  'input',
  function (e) {
    checkAddSticker();
  }
);

function addSticker() {
  let imageUrl = $('#image-url').val();
  let imageWhiteUrl = $('#image-white-url').val();
  let imageHeight = $('#image-height').val();
  let imageWidth = $('#image-width').val();
  let baseplateCode = $('#baseplate-code').val();
  let tempHtmlSticker = `<div class="sticker" style="background-image: url(${imageUrl})"></div>`;
  let tempObject = {
    width: parseFloat(imageWidth),
    height: parseFloat(imageHeight),
    printUrl: imageUrl,
    printWhiteLayerUrl: imageWhiteUrl,
    baseplate: baseplateCode,
  };
  //append to sticker row - DONE
  $('.modal-button').before(tempHtmlSticker);
  //push to JSON
  stickers.push(tempObject);
  //set sticker to view
}

$('.add').click(function () {
  if (addStickerIsFilledIn) {
    addSticker();
    $('body').removeClass('add-motive');
  }
});

//------- Initialize ----------------

document.addEventListener('DOMContentLoaded', () => {
  setTheScene();
  setFirstSticker();
});
