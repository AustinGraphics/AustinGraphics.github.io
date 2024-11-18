if (!window.navigator.standalone) {
    webappshow();
} else {
    if (!localStorage.getItem('profile')) {
        onboardingshow();
    }
}

let timetables = {};
let dayOfTheWeek = getDayOfWeek();
let currentUserTimetable = {};
// let dayOfTheWeek = 'tuesday';

fetch('/data/periods.json')
    .then(response => response.json())
    .then(timetable => {
        console.log(timetable)
        timetables = timetable;
        currentUserTimetable = timetables[localStorage.getItem('profile')];
        loadDayTimetable();
        document.getElementById('loggedinas').innerHTML = 'Logged in as ' + localStorage.getItem('profile');
    })

var periodtoggle = 0;
(document.querySelector('.periods')).addEventListener('click', function () {
    if (!periodtoggle) {
        document.querySelector('.periods').classList.remove('collapsed');
        document.querySelector('.periods').classList.add('expanded');
        periodtoggle = 1;
    } else {
        document.querySelector('.periods').classList.add('collapsed');
        document.querySelector('.periods').classList.remove('expanded');
        periodtoggle = 0;
    }
})

const defaultpage = 'home'
document.querySelectorAll('.contentbody').forEach(contentbody => {
    if (contentbody.id == defaultpage) {
        contentbody.style.display = 'flex';
    } else {
        contentbody.style.display = 'none';
    }
    document.querySelectorAll('.tabs .button').forEach(element => {
        if (element.id == (defaultpage + 'button')) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    });
});
function goto(page) {
    document.querySelectorAll('.contentbody').forEach(contentbody => {
        document.querySelectorAll('.tabs .button').forEach(element => {
            if (element.id == (page + 'button')) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
        if (contentbody.id == page) {
            contentbody.style.display = 'flex'
        } else {
            contentbody.style.display = 'none';
        }
    });
}

const absoluteDiv = document.querySelector('.tabs');

// Function to check if two rectangles overlap
function isOverlapping(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// Function to check for overlaps
function checkForOverlaps() {
    // Get all divs on the page
    const allDivs = document.querySelectorAll('div');

    // Get the bounding rectangle of the absolute div
    const absoluteRect = absoluteDiv.getBoundingClientRect();

    // Check each other div to see if it overlaps, ignoring the absoluteDiv itself and its children
    for (const div of allDivs) {
        // Exclude the absolutely positioned div itself and any children of absoluteDiv
        if (div !== absoluteDiv && !absoluteDiv.contains(div) && !div.classList.contains('contentbody')) {
            const otherRect = div.getBoundingClientRect();
            if (isOverlapping(absoluteRect, otherRect)) {
                return true; // Return true immediately if an overlap is found
            }
        }
    }
    return false; // Return false if no overlaps are found
}

// Run the checkForOverlaps function every 500 milliseconds
setInterval(function () {
    if (checkForOverlaps()) { // Call the function and check its return value
        absoluteDiv.style.backgroundColor = 'rgba(134, 134, 134, 0.136)';
        absoluteDiv.style.borderTop = '1px solid #ffffff05';
    } else {
        absoluteDiv.style.backgroundColor = '#000000';
        absoluteDiv.style.borderTop = 'none';
    }
}, 10);

function behindShrink(contentBody) {
    contentBody.classList.add('shrink');
    contentBody.style.backgroundColor = 'rgb(3, 3, 3)';
    contentBody.style.scale = '0.9';
    contentBody.style.top = '-40px';
    contentBody.style.borderRadius = '10px';
    document.querySelector('html').style.overflowY = 'hidden';
}

let timetableData = {};
let selectedUserName = '';
console.log(localStorage.getItem('profile'));

async function sheetshow(name) {
    document.querySelector('.sheet').style.display = 'unset';
    setTimeout(() => {
        document.querySelector('.sheet').classList.add('show');
    }, 10);
    document.querySelectorAll('.contentbody').forEach(contentBody => {
        behindShrink(contentBody);
    });
    document.getElementById(name).classList.add('highlighted');

    // STARTING DATE ON SLIDER IS HERE!!!!
    document.querySelectorAll(`.segmentedcontrols .item${dayOfTheWeek}`).forEach(day => {
        document.querySelectorAll('.segmentedcontrols .item').forEach(other => {
            if (other.id != day.id) {
                other.classList.remove('selected');
            }
        });
        day.classList.add('selected');
        console.log(document.querySelector('.segmentedcontrols .selector').clientWidth * (Array.prototype.indexOf.call(document.querySelector('.segmentedcontrols').children, day)));
        document.querySelector('.segmentedcontrols .selector').style.marginLeft = (document.querySelector('.segmentedcontrols .selector').clientWidth * (Array.prototype.indexOf.call(document.querySelector('.segmentedcontrols').children, day))) + 'px';
    });

    document.querySelector('.sheet .top .title').innerHTML = name;

    // Fetch the timetable JSON data once
    async function loadTimetable(name) {
        timetableData = timetables[name];
        updatePeriodsWithBlur(dayOfTheWeek, currentUserTimetable, name);
    }

    // Call the function with the user's name
    selectedUserName = name;
    loadTimetable(name);
}

function sheethide() {
    const draggableDiv = document.querySelector('.sheet');
    draggableDiv.classList.remove("show");
    draggableDiv.style.bottom = `-100vh`; // Reset position
    document.querySelectorAll('.contentbody').forEach(contentBody => {
        contentBody.classList.remove('shrink');
        contentBody.style.backgroundColor = 'unset';
        contentBody.style.scale = '1';
        contentBody.style.borderRadius = '0px';
        contentBody.style.top = '0px';
        contentBody.style.transition = 'scale cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, background-color cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, top cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, border-radius cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s';
        document.querySelector('html').style.overflowY = 'unset';
    });
    setTimeout(() => {
        draggableDiv.style.display = 'none';
        document.querySelectorAll('.person').forEach(person => {
            person.classList.remove('highlighted');
        });
    }, 500);
}

const draggableDiv = document.querySelector(".sheet");
let startY = 0;
let lastY = 0;
let velocity = 0;
let dragging = false;

draggableDiv.addEventListener("touchstart", (e) => {
    // Check if 'show' class is in the div's classList
    if (!draggableDiv.classList.contains("show")) return;

    const touch = e.touches[0];
    startY = touch.clientY;
    lastY = startY;
    dragging = startY <= 1000;

    draggableDiv.style.transition = 'none';
    document.querySelectorAll('.contentbody').forEach(contentBody => {
        contentBody.classList.add('shrink');
    });
});

function interpolateColor(color1, color2, percentage) {
    // Extract RGB components from the first color
    const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
    // Extract RGB components from the second color
    const [r2, g2, b2] = color2.match(/\d+/g).map(Number);

    // Interpolate each component based on the percentage
    const r = Math.round(r1 + (r2 - r1) * percentage);
    const g = Math.round(g1 + (g2 - g1) * percentage);
    const b = Math.round(b1 + (b2 - b1) * percentage);

    return `rgb(${r}, ${g}, ${b})`;
}

draggableDiv.addEventListener("touchmove", (e) => {
    if (!dragging) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    velocity = touch.clientY - lastY; // Calculate velocity
    lastY = touch.clientY;

    // Update the position of the div as the user drags
    draggableDiv.classList.remove('show');
    draggableDiv.style.bottom = `-${deltaY}px`;

    // Calculate drag progress as a percentage (0 at the top, 1 at the bottom)
    const progress = Math.min(1, deltaY / draggableDiv.offsetHeight);

    // Update the background color of each .contentbody
    document.querySelectorAll('.contentbody').forEach(contentBody => {
        // Define the initial color and the target color (black)  
        const initialColor = "rgb(3, 3, 3)";
        const targetColor = "rgb(0, 0, 0)";

        // Interpolate the color based on the progress
        contentBody.style.transition = 'none';
        contentBody.style.backgroundColor = interpolateColor(initialColor, targetColor, progress);
        contentBody.style.scale = (0.9 + (1 - 0.9) * progress);
        var topCalc = (-40 * (1 - progress));
        var borderCalc = (10 * (1 - progress));
        contentBody.style.top = `${topCalc}px`;
        contentBody.style.borderRadius = `${borderCalc}px`
    });
});

draggableDiv.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;

    const divHeight = draggableDiv.offsetHeight;
    const draggedAmount = lastY - startY;

    draggableDiv.style.transition = 'bottom cubic-bezier(.12,.71,.49,1) 0.5s';

    // Only allow removal if dragged downwards (positive draggedAmount) 
    if ((draggedAmount > divHeight / 2 || velocity > 10) && draggedAmount > 0) {
        draggableDiv.classList.remove("show");
        draggableDiv.style.bottom = `-100vh`; // Reset position
        document.querySelectorAll('.contentbody').forEach(contentBody => {
            contentBody.classList.remove('shrink');
            contentBody.style.backgroundColor = 'unset';
            contentBody.style.scale = '1';
            contentBody.style.borderRadius = '0px';
            contentBody.style.top = '0px';
            contentBody.style.transition = 'scale cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, background-color cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, top cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, border-radius cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s';
        });
        setTimeout(() => {
            draggableDiv.style.display = 'none';
            document.querySelectorAll('.person').forEach(person => {
                person.classList.remove('highlighted');
            });
        }, 500);
    } else {
        draggableDiv.classList.add('show');
        draggableDiv.style.bottom = `0px`; // Reset position if condition isn't met
        document.querySelectorAll('.contentbody').forEach(contentBody => {
            behindShrink(contentBody);
            contentBody.style.transition = 'scale cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, background-color cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, top cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, border-radius cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s';
        });
    }
});

document.querySelectorAll('.segmentedcontrols .item').forEach(day => {
    day.addEventListener('click', async () => {
        document.querySelectorAll('.segmentedcontrols .item').forEach(other => {
            other.classList.toggle('selected', other === day);
        });

        const selector = document.querySelector('.segmentedcontrols .selector');
        selector.style.marginLeft = (selector.clientWidth * Array.prototype.indexOf.call(day.parentNode.children, day)) + 'px';

        updatePeriodsWithBlur(day.id, currentUserTimetable, selectedUserName);
    });
});

function updatePeriodsWithBlur(dayId, currentUserTimetable, selectedname) {
    const periodsContainer = document.querySelector('.sheet .periods');
    const dayData = timetableData[dayId];
    const userDayData = currentUserTimetable[dayId];

    const periods = Array.from(periodsContainer.querySelectorAll('.period'));
    console.log(dayId);

    if (dayData) {
        periodsContainer.classList.add('blurred');

        setTimeout(() => {
            periods.forEach((periodDiv, index) => {
                const periodKey = `period ${index + 1}`;
                const periodData = dayData[periodKey];

                if (periodData) {
                    const bodyDiv = periodDiv.querySelector('.body');
                    const extraDiv = periodDiv.querySelector('.extra');
                    const mainText = periodData.name;

                    if (bodyDiv) {
                        bodyDiv.firstChild.nodeValue = mainText + " ";
                        periodDiv.classList.toggle('highlight', mainText === "Free" && userDayData[periodKey]?.name === "Free");
                    }

                    if (extraDiv) {
                        extraDiv.innerHTML = `${periodData.duration}`;
                        if (mainText === "Free") {
                            extraDiv.innerHTML += `<div class="people">${((frees[dayId][periodKey]).filter(name => name !== selectedname)).join(', ')}</div>`;
                        }
                    }
                }
            });

            periodsContainer.classList.remove('blurred');
        }, 75);
    }
}

function loadDayTimetable() {
    const periodsContainer = document.querySelector('.contentbody#home>.periods');
    periodsContainer.classList.add('blurred');

    setTimeout(() => {
        const periods = Array.from(periodsContainer.querySelectorAll('.period'));
        periods.forEach((periodDiv, index) => {
            const periodKey = `period ${index + 1}`;
            const periodData = currentUserTimetable[dayOfTheWeek][periodKey];

            if (periodData) {
                const bodyDiv = periodDiv.querySelector('.body');
                const extraDiv = periodDiv.querySelector('.extra');
                const mainText = periodData.name;

                if (bodyDiv) {
                    bodyDiv.firstChild.nodeValue = mainText + " ";
                }

                if (extraDiv) {
                    extraDiv.innerHTML = `${periodData.duration}`;
                    if (mainText === "Free") {
                        extraDiv.innerHTML += `<div class="people">${((frees[dayOfTheWeek][periodKey]).filter(name => name !== localStorage.getItem('profile'))).join(', ')}</div>`;
                    }
                }
            }
        });
        periodsContainer.classList.remove('blurred');
    }, 75);
}

function webappshow() {
    setTimeout(() => {
        document.querySelector('.sheet.webapp').style.display = 'flex'
        setTimeout(() => {
            document.querySelector('.sheet.webapp').classList.add('show');
        }, 10);
        document.querySelectorAll('.contentbody').forEach(contentBody => {
            behindShrink(contentBody);
        });
    }, 300);
    document.querySelector('.sheet.webapp').querySelectorAll('.continue').forEach(button => {
        button.addEventListener('click', () => {
            button.parentElement.style.marginLeft = '-100vw';
        })
    });
}

function onboardingshow() {
    setTimeout(() => {
        document.querySelector('.sheet.onboarding').style.display = 'flex'
        setTimeout(() => {
            document.querySelector('.sheet.onboarding').classList.add('show');
        }, 10);
        document.querySelectorAll('.contentbody').forEach(contentBody => {
            behindShrink(contentBody);
        });
    }, 300);
    document.querySelector('.sheet.onboarding').querySelectorAll('.continue:not(.close)').forEach(button => {
        button.addEventListener('click', () => {
            button.parentElement.style.marginLeft = '-100%';
        })
    });
    document.querySelector('.sheet.onboarding').querySelectorAll('.person').forEach(person => {
        person.addEventListener('click', () => {
            person.classList.add('select');
            console.log(person.id)
            localStorage.setItem('profile', person.id);
            console.log(localStorage.getItem('profile'));
            document.querySelector('.sheet.onboarding').querySelector('.continue.people').classList.remove('disabled');
            document.querySelector('.sheet.onboarding').querySelectorAll('.person').forEach(other => {
                if (other != person) {
                    other.classList.remove('select');
                }
            });
        })
    });
}

function onboardinghide() {
    currentUserTimetable = timetables[localStorage.getItem('profile')];
    loadDayTimetable();
    const draggableDiv = document.querySelector('.sheet.onboarding');
    draggableDiv.classList.remove("show");
    draggableDiv.style.bottom = `-100vh`; // Reset position
    document.querySelectorAll('.contentbody').forEach(contentBody => {
        contentBody.classList.remove('shrink');
        contentBody.style.backgroundColor = 'unset';
        contentBody.style.scale = '1';
        contentBody.style.borderRadius = '0px';
        contentBody.style.top = '0px';
        contentBody.style.transition = 'scale cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, background-color cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, top cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s, border-radius cubic-bezier(0.25, 0.1, 0.25, 1) 0.5s';
        document.querySelector('html').style.overflowY = 'unset';
    });
    setTimeout(() => {
        draggableDiv.style.display = 'none';
        document.querySelectorAll('.person').forEach(person => {
            person.classList.remove('highlighted');
        });
    }, 500);
}

function displayMenu(week, day) {
    document.querySelector('.contentbody#lunch .subheading extra').innerHTML = day.charAt(0).toUpperCase() + day.slice(1);;
    const menuDiv = document.querySelector('.menu');

    // Clear previous menu items
    menuDiv.innerHTML = '';

    // Fetch the menu data from the specified URL
    fetch('/data/lunch.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(menuData => {
            // Validate week and day
            const weekKey = `week${week}`;
            if (!menuData[weekKey] || !menuData[weekKey][day]) {
                console.error('Invalid week or day');
                menuDiv.innerHTML = `<p>No menu available for Week ${week}, ${day}.</p>`;
                return;
            }

            const dayMenu = menuData[weekKey][day];

            // Generate menu items
            dayMenu.forEach(item => {
                const menuItemDiv = document.createElement('div');
                menuItemDiv.classList.add('menuitem');

                const typeDiv = document.createElement('div');
                typeDiv.classList.add('type');
                typeDiv.textContent = item.type;

                const foodDiv = document.createElement('div');
                foodDiv.classList.add('food');
                foodDiv.textContent = item.name;

                const contentsDiv = document.createElement('div');
                contentsDiv.classList.add('contents');
                contentsDiv.textContent = item.contents;

                // Append all parts to the menu item
                menuItemDiv.appendChild(typeDiv);
                menuItemDiv.appendChild(foodDiv);
                menuItemDiv.appendChild(contentsDiv);

                // Append the menu item to the main menu div
                menuDiv.appendChild(menuItemDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching menu data:', error);
            menuDiv.innerHTML = `<p>Failed to load menu data. Please try again later.</p>`;
        });
}

function getDayOfWeek() {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDate = new Date();
    const dayIndex = currentDate.getDay(); // Returns an integer (0-6)
    return daysOfWeek[dayIndex];
}

// Example usage: Display the menu for week 1, Monday
displayMenu(1, dayOfTheWeek);

let frees = {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {}
};

// Fetch the periods.json file (ensure it's correctly served from the server)
fetch('/data/periods.json')
    .then(response => response.json())
    .then(data => {
        // Iterate through each person
        for (let person in data) {
            let schedule = data[person];

            // Iterate through each weekday
            for (let day in schedule) {
                let periods = schedule[day];

                // Iterate through each period in the day
                for (let period in periods) {
                    let periodData = periods[period];

                    // Check if the person is free for this period
                    if (periodData.name === "Free") {
                        // If this period is not yet in the frees object, initialize it as an empty array
                        if (!frees[day][period]) {
                            frees[day][period] = [];
                        }

                        // Add the person's name to the array for this period
                        frees[day][period].push(person);
                    }
                }
            }
        }

        // Log the final frees object
        console.log(frees);
    })
    .catch(error => {
        console.error('Error loading periods.json:', error);
    });

function logout() {
    localStorage.removeItem('profile');
    location.reload();
}