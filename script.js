
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //show all song
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""

    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
                        <img class="invert" src="Images/music.svg" alt="">
                        <div class="info">
                            <div> ${song.replaceAll("%20", " ")}</div>
                            <div>Anuj</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="Images/play1.svg" alt="">
                        </div>
        </l>`;
    }
    //play first songs
    // var audio = new Audio(songs[0]);
    // audio.play();

    //Attach an event listner to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}


const playMusic = (track, pause = false) => {
    // let audio=new Audio("/Spotify-Clone/songs/" + track)
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        playseek.src = "Images/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:3000/Spotify-clone/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardcontainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0])
            let a = await fetch(`http://127.0.0.1:3000/Spotify-clone/songs/${folder}/info.json/`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}"  class="card ">
            <div class="play">
                <img id="play" src="Images/play.svg" alt="">
            </div>
            <img src="/Spotify-clone/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p> ${response.discription} </p>
            </div>`
        }
    }
     //Load playlist when folder is clicked

     Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`Spotify-Clone/songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])        
        })
    })
}

async function main() {
    //get list of songs
    await getsongs("Spotify-Clone/songs/ncs");
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayalbums()

    //Attach event listener to play song on seekbar
    playseek.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            playseek.src = "Images/pause.svg"
        }
        else {
            currentsong.pause()
            playseek.src = "Images/play.svg"
        }
    })

    // /time update

    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    //Addd event listener to seek bar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    //Event listener for hamburgur
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //close button

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add am event listener to previous and end

    prev.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) > 0) {
            playMusic(songs[index - 1]);
        }

    })
    next.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }

    })

    //Add event listener to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
        if (parseInt(e.target.value) / 100 == 0) {
            vol.src = "Images/volumemute.svg"
        } else {
            vol.src = "Images/volume.svg"
        }
    })

    //Event listerner to mute

    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","volumemute.svg")
            currentsong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("volumemute.svg","volume.svg")
            currentsong.volume=.10
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })
   
}

main()