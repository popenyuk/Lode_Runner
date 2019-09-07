// taken from https://www.w3schools.com/graphics/game_sound.asp, as this is not the main point in the project
export function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);

    this.play = function () {
        this.sound.loop = true;
        this.sound.play();
    };

    this.stop = function () {
        this.sound.pause();
    };
}