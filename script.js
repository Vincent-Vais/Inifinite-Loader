// Photos vars
let photosArr = [];
let gridArr = ["grid-1", "grid-2", "grid-3"];
let classArr = [
  "grid-a",
  "grid-b",
  "grid-c",
  "grid-d",
  "grid-e",
  "grid-f",
  "grid-g",
];

const numGrids = gridArr.length;
const numItems = classArr.length;

const imageContainer = document.getElementById("image-container");
const loader = document.getElementById("loader");

let ready = false;
let imgsLoaded = 0;
let totalImgs = 0;

// Unsplash API
const count = 21;
const key = "OVlsZSJeagoI8soLkbwqux-PoAYhlRflY0rOhJc71dA";

const apiURL = `https://api.unsplash.com/photos/random/?client_id=${key}&count=${count}`;

// Get Photos from Unsplash API
async function getPhotos() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    console.log(data);
    populateArr(data);
    const markup = getMarkup();
    displayPhotos(markup);
    resetVars();
  } catch (e) {
    console.log("Error, ", e);
  }
}

// GetUser info
async function getUserData(username) {
  const response = await fetch(
    `https://api.unsplash.com/users/${username}/?client_id=${key}`
  );
  const data = await response.json();
  const user = {
    name: data.name,
    img: data.profile_image.large,
    location: data.location,
    downloads: data.downloads,
    photos: data.total_photos,
    likes: data.total_likes,
    unsplash: data.links.html, // link to unsplash
    inst: data.instagram_username,
    twitter: data.twitter_username,
  };
  return user;
}

// Clean recieved data and store in global array
function populateArr(obj) {
  photosArr = obj.map((item) => {
    return {
      descr: item.alt_description,
      linkWS: item.links.html,
      urlImg: item.urls.regular,
      user: item.user.username,
    };
  });
}

// Make a markup from the data stored in global array
function getMarkup() {
  totalImgs = photosArr.length;
  // Array of grids
  let gridDivs = [];

  let j = 0;
  while (j < photosArr.length) {
    // Pushiing into an array a grid
    gridDivs.push(createGridTree(j));

    j += numItems;
  }
  return gridDivs;
}
//      Helpers for creating markup
function createGridTree(counter) {
  // Create <div> to hold a grid
  const gridDiv = createGridDiv();

  // Create arr to hold grid items
  let gridItems = [];
  for (let i = counter; i < photosArr.length; i++) {
    if (i < photosArr.length / numGrids + counter) {
      // Create grid item (<div> > <a> > <img>) and push to an array
      gridItems.push(createGridItem(photosArr[i]));
    } else break;
  }
  // gridItems.length === $numItems*n
  gridItems.forEach((item) => {
    // Make an HTML tree (griDiv > [grid items])
    gridDiv.appendChild(item);
  });
  classArr = [
    "grid-a",
    "grid-b",
    "grid-c",
    "grid-d",
    "grid-e",
    "grid-f",
    "grid-g",
  ];
  return gridDiv;
}
function createGridDiv() {
  // Create <div>
  const gridDiv = document.createElement("div");
  // Choose on of $numGrids grids
  gridDiv.setAttribute("class", getRandomClass(gridArr));

  return gridDiv;
}
function createGridItem(item) {
  // Create grid element <div> to hold <a> and <img>
  const div = document.createElement("div");
  // Choose one of $numItems grid elemnts
  const gridItemClass = getRandomClass(classArr);
  div.setAttribute("class", `grid-item ${gridItemClass}`);
  div.setAttribute("data-username", `${item.user}`);

  // Create a front side <div>
  const front = document.createElement("div");
  front.setAttribute("class", "front");

  // Create a back side <div>
  const back = document.createElement("div");
  back.setAttribute("class", "back");

  // Create <a> to link to Unsplash
  const a = document.createElement("a");
  a.setAttribute("href", item.linkWS);

  // Create <img>
  const img = document.createElement("img");
  img.setAttribute("src", item.urlImg);
  img.setAttribute("alt", item.descr);
  img.setAttribute("title", item.descr);

  // Keep track of when and how many images were loaded
  img.addEventListener("load", imageLoaded);

  // Put <img> inside <a>
  a.appendChild(img);

  // Create a <div> popper
  const popper = document.createElement("div");
  popper.setAttribute("class", "popper");

  // Create a btn in popper to flip sides
  const btn = document.createElement("button");
  // Setting data attributes to keep track of sides
  btn.setAttribute("data-state", "front");
  btn.setAttribute("data-flips", "0");

  btn.innerText = "Click Me";

  // Put <btn> inside <div class="popper">
  popper.appendChild(btn);

  // Logic to display different sides of grid element and get user info
  addFlipper(btn);

  // Put <a> > <img> & <div class="popper"> inside <front>
  front.appendChild(a);
  // front.appendChild(popper);

  // Put <div class="front"> & <div class="back"> & <div class="popper"> inside <div>
  div.appendChild(front);
  div.appendChild(back);
  div.appendChild(popper);

  return div;
}

function getRandomClass(arr) {
  let idx = Math.floor(Math.random() * arr.length);
  return arr.splice(idx, 1);
}

// Check if all images were loaded
function imageLoaded() {
  imgsLoaded++;
  if (imgsLoaded === totalImgs) {
    ready = true;
    loader.hidden = true;
  }
}

// Flip sides of a grid element
function addFlipper(btn) {
  btn.addEventListener("click", (e) => {
    // Animating grid element to show back / front side
    e.target.closest(".grid-item").classList.toggle("flip");

    // Animating popper to make a "toggle"
    e.target.closest(".popper").classList.add("animate");
    window.setTimeout(
      (el) => {
        el.classList.remove("animate");
      },
      1500,
      e.target.closest(".popper")
    );

    // Fetching and/or Cleaning and/or Displaying more data
    showBackUI(e.target);
  });
}

// Controller to back side UI
function showBackUI(el) {
  // Username to fetch by
  const username = el.closest(".grid-item").dataset.username;

  // Logic to decide what side is user on
  if (el.dataset.state === "front") {
    // Logic to see if user data was ever fetched
    if (el.dataset.flips === "0") handleMoreData(el, username);
    // Maintance(state)
    el.dataset.state === "back";
  } else {
    // Maintance(state)
    el.dataset.state === "front";
  }
}

// Fetching, Cleaning & Displaying more data
async function handleMoreData(el, username) {
  // Finding a right parent element
  let anchor;
  let loader;
  const doc = el.closest(".grid-item");
  for (let i = 0; i < doc.childNodes.length; i++) {
    if (doc.childNodes[i].className.includes("back")) {
      anchor = doc.childNodes[i];
      const loaderBack = document.createElement("div");
      loaderBack.setAttribute("class", "loader-back");
      const loaderImg = document.createElement("img");
      loaderImg.setAttribute("src", "./img/back-loader.svg");
      loaderBack.appendChild(loaderImg);
      anchor.appendChild(loaderBack);
      loader = loaderBack;
      break;
    }
  }

  // Fetching user data
  const data = await getUserData(username);

  // Displaying fetched data
  displayUser(data, anchor, loader);

  // Maintance(flips)
  el.dataset.flips = "1";
}

// Display Photos on the screen
function displayPhotos(arr) {
  arr.forEach((item) => imageContainer.appendChild(item));
}

// Display User info after flipped a side
function displayUser(data, anchor, loader) {
  // Create component <div class="bio"> to hold all bio data
  const bio = document.createElement("div");
  bio.setAttribute("class", "bio");

  // Create item in comp. <div class="bio__image"> to hold an image
  const bioImage = document.createElement("div");
  bioImage.setAttribute("class", "bio__image");

  // Create <img>
  const img = document.createElement("img");
  img.setAttribute("src", `${data.img}`);

  // <div class"bio__image"> > <img>
  bioImage.appendChild(img);

  // Create item in comp. <div class="bio__text"> to hold all the bio text
  bioText = document.createElement("div");
  bioText.setAttribute("class", "bio__text");

  let bioTextChildren = [];
  // Create element of item in comp. <h3> to hold the name
  const bioH3 = document.createElement("h3");
  bioH3.innerText = `${data.name}`;
  bioTextChildren.push(bioH3);

  // Create element of item in comp. <p> to hold the actual bio
  if (data.bio) {
    const bioP = document.createElement("p");
    bioP.innerText = `${data.bio}`;
    bioTextChildren.push(bioP);
  }

  // Create element of item in comp. <p> to hold location
  if (data.location) {
    const bioH4 = document.createElement("h4");
    bioH4.innerHTML = `<i class="fas fa-globe-americas fa-2x"></i>${data.location}`;
    bioTextChildren.push(bioH4);
  }

  // Iterate over children and append to item in component
  for (let i = 0; i < bioTextChildren.length; i++) {
    bioText.appendChild(bioTextChildren[i]);
  }

  bio.appendChild(bioImage);
  bio.appendChild(bioText);

  // Create component <div class="stats"> to hold all stats data
  const stats = document.createElement("stats");
  stats.setAttribute("class", "stats");

  // Create item in comp. <div class="social"> to hold all links to social media
  const social = document.createElement("div");
  social.setAttribute("class", "social");

  let socialArr = [];
  // Create <a> > <i> for social links with icons
  if (data.unsplash) {
    const unsplash = document.createElement("a");
    unsplash.setAttribute("href", `${data.unsplash}`);
    unsplash.innerHTML = `<i class="fab fa-unsplash"></i>`;
    socialArr.push(unsplash);
  }

  if (data.inst) {
    const inst = document.createElement("a");
    inst.innerHTML = `<i class="fab fa-instagram"></i>`;
    inst.setAttribute("href", `https://www.instagram.com/${data.inst}`);
    socialArr.push(inst);
  }

  if (data.twitter) {
    const twitter = document.createElement("a");
    twitter.innerHTML = `<i class="fab fa-twitter"></i>`;
    twitter.setAttribute("href", `https://twitter.com/${data.twitter}`);
    socialArr.push(twitter);
  }

  // Make each link to be a child of <div class="social">
  socialArr.forEach((item) => social.appendChild(item));

  // Create item in comp. <div class="stats-photos"> to  all stats about photos made
  const statsPhotos = document.createElement("div");
  statsPhotos.setAttribute("class", "stats-photos");

  // Create photo stats with icons
  const H4_1 = document.createElement("h4");
  H4_1.innerHTML = `<i class="fas fa-images"></i>${data.photos}`;

  const H4_2 = document.createElement("h4");
  H4_2.innerHTML = `<i class="far fa-thumbs-up"></i>${data.likes}`;

  const H4_3 = document.createElement("h4");
  H4_3.innerHTML = `<i class="fas fa-download"></i>${data.downloads}`;

  [H4_1, H4_2, H4_3].forEach((item) => statsPhotos.appendChild(item));

  stats.appendChild(social);
  // stats.appendChild(statsPhotos);
  // bio.appendChild(statsPhotos);
  bioText.appendChild(statsPhotos);

  // console.log(anchor);
  // console.log(bio);
  // console.log(stats);

  loader.hidden = true;

  anchor.appendChild(bio);
  anchor.appendChild(stats);
}

// Remove all the data from the global array
function resetVars() {
  photosArr = [];
  gridArr = ["grid-1", "grid-2", "grid-3"];
  classArr = [
    "grid-a",
    "grid-b",
    "grid-c",
    "grid-d",
    "grid-e",
    "grid-f",
    "grid-g",
  ];
}

// Check to see if scrolling near the bottom of the page, if so - get more photos
window.addEventListener("scroll", (e) => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
    ready
  ) {
    ready = false;
    imgsLoaded = 0;
    getPhotos();
  }
});

// On Load
getPhotos();
