const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
    constructor (field) {
        this._field = field
        this._playerRow = 0
        this._playerCol = 0
        this._running = true //Game terminates if switched to false.
        this._field[this._playerCol][this._playerRow] = pathCharacter //Place first path character at starting co-ordinates
        this.btMsg = "There is no going back across your path, the only way is forward."
        this.fallMsg = "You stepped off the edge and will now float for eternity in the unknown void. Game over.\n"
        this.holeMsg = "You fell down a hole into the bottomless abyss. Game over.\n"
        this.winMsg = "You found your hat- now you look fly as hell. You win!\n"
        this.invalidDirMsg = "Please choose a valid direction."
        this.displayMsg = null
    }

    static generateGameField (x = 10, y = 10, pc = 20) {
        // Percentage of squares that are holes is limited from 0 - 40. Default is 20. Min grid size is 3x3.
        if (pc < 0) {
            pc = 0
        } else if (pc > 40) {
            pc = 40
        }
        if (x < 3) {
            x = 3
        }
        if (y < 3) {
            y = 3
        }
        //Create x * y 2D array of blank field characters. Array.from() is used to prevent each row from referencing the same array held in memory.
        const newField = new Field(Array.from({length: y}, a => new Array(x).fill(fieldCharacter)))
        const gridSize = x*y
        let maxHoles = Math.floor(gridSize * pc / 100) //% of squares that are holes. Allows scaling to different sized grids.
        if (maxHoles == 0) {
            maxHoles = 1
        }
        let holesPlaced = 0

        while (holesPlaced < maxHoles) {
            let randomCoords = newField.getRandomCoords()
            if (newField.getCharAtCoords(...randomCoords) != hole 
            && newField.getCharAtCoords(...randomCoords) != pathCharacter) {
                newField.setCharAtCoords(hole, ...randomCoords)
                holesPlaced ++
            }
        }

        while (true) {
            let randomCoords = newField.getRandomCoords()
            if (newField.getCharAtCoords(...randomCoords) != hole
            && newField.getCharAtCoords(...randomCoords) != pathCharacter) {
                newField.setCharAtCoords(hat, ...randomCoords)
                break
            }
        }

        return newField
    };

    print () {
        this._field.forEach((a) => process.stdout.write(a.join('') + "\n"))
        if (this.displayMsg != null) {
            console.log(this.displayMsg)
            this.displayMsg = null
        }
    };

    getRandomCoords () {
        return [Math.floor(Math.random() * this._field[0].length), Math.floor(Math.random() * this._field.length)]
    };

    getCharAtCoords (x = this._playerRow, y = this._playerCol) {
        return this._field[y][x]
    };

    setCharAtCoords (char, x, y) {
        this._field[y][x] = char
    };

    setStartCoords (x, y) {
        this._field[this._playerCol][this._playerRow] = fieldCharacter
        this._playerRow = x
        this._playerCol = y
        this._field[this._playerCol][this._playerRow] = pathCharacter
    };

    setRandomStart () {
        let coords = this.getRandomCoords()
        if (this.getCharAtCoords(...coords) == fieldCharacter) {
            this.setStartCoords(...coords)
        } else {
            this.setRandomStart()
        }
    }

    handleEdgeFall () {
        this.displayMsg = this.fallMsg
        this._running = false
    };

    isOutOfField (x, y) {
        if (x < 0 || x >= this._field[0].length) {
            return true
        }
        if (y < 0 || y >= this._field.length) {
            return true
        }
        return false
    }

    move (dir) {
        let coordShift = [0, 0]
        switch (dir.toUpperCase()) {
            case "U":
                coordShift = [0, -1]
                break
            case "D":
                coordShift = [0, 1]
                break
            case "L":
                coordShift = [-1, 0]
                break
            case "R":
                coordShift = [1, 0]
                break
            default:
                this.displayMsg = this.invalidDirMsg
        }

        let newCoords = [this._playerRow + coordShift[0], this._playerCol + coordShift[1]]
        if (this.isOutOfField(...newCoords)) {
            this.handleEdgeFall()

        //Handle backtracking or crossing the existing path. Account for no movement in cases of invalid input.
        } else if (this.getCharAtCoords(...newCoords) == pathCharacter && (coordShift[0] != 0 || coordShift[1] != 0)) {
            this.displayMsg = this.btMsg

        } else { //Apply the new co-ordinates
            this._playerRow += coordShift[0]
            this._playerCol += coordShift[1]
        }
        
        this.processNewPosition()
    };

    //Check for win/lose conditions, otherwise update path.
    processNewPosition () {
        if (this.getCharAtCoords() == hat) {
            this.displayMsg = this.winMsg
            this._running = false

        } else if (this.getCharAtCoords() == hole) {
            this.displayMsg = this.holeMsg
            this._running = false

        } else {
            this._field[this._playerCol][this._playerRow] = pathCharacter
        }
    };
};

const playGame = (field) => {
    console.clear() //Unnecessary in gitbash, ?compatability with different OS's.
    field.print()
    while (field._running) {
        let dir = prompt("Which way? (U)p, (D)own, (L)eft, or (R)ight?")
        console.clear()
        field.move(dir)
        field.print()
    }
    process.exit()
};


const gameField = Field.generateGameField()
gameField.setRandomStart()
playGame(gameField)