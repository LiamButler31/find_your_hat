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
        this._running = true
        //Place first path character at starting co-ordinates
        this._field[this._playerCol][this._playerRow] = pathCharacter
        this.btMsg = "There is no going back across your path, the only way is forward."
        this.fallMsg = "You stepped off the edge and will now float for eternity in the unknown void. Game over.\n"
        this.holeMsg = "You fell down a hole into the bottomless abyss. Game over.\n"
        this.winMsg = "You found your hat- now you look fly as hell. You win!\n"
        this.invalidDirMsg = "Please choose a valid direction."
        this.displayMsg = null
    }

    static generateGameField (x, y, pc = 20) {
        // Percentage of squares that are holes is limited from 0 - 40. Default is 20 
        if (pc < 0) {
            pc = 0
        } else if (pc > 40) {
            pc = 40
        }
        const newField = new Field(Array.from({length: y}, a => new Array(x).fill(fieldCharacter)))
        const gridSize = x*y
        const maxHoles = Math.floor(gridSize * pc / 100) //% of squares that are holes.
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

    static validateField (field) {

    }

    getRandomCoords () {
        return [Math.floor(Math.random() * this._field[0].length), Math.floor(Math.random() * this._field.length)]
    };

    print () {
        this._field.forEach((a) => process.stdout.write(a.join('') + "\n"))
        if (this.displayMsg != null) {
            console.log(this.displayMsg)
            this.displayMsg = null
        }
    };

    checkPosition () {
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

    //Return character at given coordinates. Default to players current position.
    getCharAtCoords (x = this._playerRow, y = this._playerCol) {
        return this._field[y][x]
    };

    setCharAtCoords (char, x, y) {
        if (this._field[y][x] == char) {
            return "retry"
        } else {
            this._field[y][x] = char
        }
    };

    //Return the field character at a position relative to the players current position.
    getRelChar (x, y) {
        return this._field[this._playerCol + y][this._playerRow + x]
    };

    handleEdgeFall () {
        this.displayMsg = this.fallMsg
        this._running = false
    };

    move (dir) {
        console.clear()
        switch (dir.toUpperCase()) {
            case "U":
                if (this._playerCol - 1 < 0) {
                    this.handleEdgeFall()
                    break
                } else if (this.getRelChar(0,-1) == pathCharacter) {
                    this.displayMsg = this.btMsg
                    break
                } 
                this._playerCol -= 1
                break

            case "D":
                if (this._playerCol + 1 >= this._field.length) {
                    this.handleEdgeFall()
                    break             
                } else if (this.getRelChar(0,1) == pathCharacter) {
                    this.displayMsg = this.btMsg
                    break
                }
                this._playerCol += 1
                break

            case "L":
                if (this._playerRow - 1 < 0) {
                    this.handleEdgeFall()
                    break
                } else if (this.getRelChar(-1,0) == pathCharacter) {
                    this.displayMsg = this.btMsg
                    break
                }
                this._playerRow -= 1
                break

            case "R":
                if (this._playerRow + 1 >= this._field[0].length) {
                    this.handleEdgeFall()
                    break
                } else if (this.getRelChar(1, 0) == pathCharacter) {
                    this.displayMsg = this.btMsg
                    break
                }
                this._playerRow += 1
                break
            default:
                this.displayMsg = this.invalidDirMsg
        }
        
        this.checkPosition()
    };

    setStartCoords (x, y) {
        this._field[this._playerCol][this._playerRow] = fieldCharacter
        [this._playerRow, this._playerCol] = [x, y]
        this._field[this._playerCol][this._playerRow] = pathCharacter
    };
};

const playGame = (field) => {
    console.clear()
    field.print()
    while (field._running) {
        let dir = prompt("Which way? (U)p, (D)own, (L)eft, or (R)ight?")
        field.move(dir)
        field.print()
    }
    process.exit()
};


const holeField = Field.generateGameField(10,10,60)

playGame(holeField)
