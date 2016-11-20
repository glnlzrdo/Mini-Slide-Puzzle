function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    for (var src in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

function createTile(img, xAxis, yAxis) {
    return new Konva.Image({
        image: img,
        x: xAxis,
        y: yAxis,
        width: 100,
        height: 100,
        stroke: 'white',
        strokeWidth: 0.5
    });
}

function buildStage(images) {
    var tile = [0, 0, 0, 0, 0, 0, 0, 0];
    var img = [images.tile0, images.tile1, images.tile2, images.tile3,
        images.tile4, images.tile5, images.tile6, images.tile7
    ];
    // To be used by shufflePuzzle
    var coordinates = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];
    // To be used by isSolvable
    var puzzlePosition = [];

    var isSolved = true;

    var shuffler = document.createElement('audio');
    shuffler.setAttribute('src', './media/shuffle-sound.mp3');

    var woosh = document.createElement('audio');
    woosh.setAttribute('src', './media/woosh.mp3');

    var locked = document.createElement('audio');
    locked.setAttribute('src', './media/locked.mp3');

    function createTileEvents(index) {

        tile[index].on('click', function() {
            moveTile(tile[index]);
        });

        tile[index].on('mouseover', function() {
            this.opacity(0.8);
            layer.draw();
        });

        tile[index].on('mouseout', function() {
            this.opacity(1);
            layer.draw();
        });

    }

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (i != 2 || j != 2) {
                var index = (i * 2) + (j + i);
                tile[index] = createTile(
                    img[index],
                    j * 100,
                    i * 100);
                layer.add(tile[index]);

                // Assigns all coordinates of the tiles
                coordinates[index][0] = j * 100;
                coordinates[index][1] = i * 100;
                coordinates[index][2] = index + 1;
                // Autogenerate events linked to each tile
                createTileEvents(index);
            }
        }
    }

    stage.add(layer);

    var space = {
        "x": 200,
        "y": 200
    }

    function animateX(tileArg, distance) {
        woosh.play();
        var tween = new Konva.Tween({
            node: tileArg,
            duration: 0.2,
            x: tileArg.x() + distance,
            y: tileArg.y()
        });
        tween.play();
    }

    function animateY(tileArg, distance) {
        woosh.play();
        var tween = new Konva.Tween({
            node: tileArg,
            duration: 0.2,
            x: tileArg.x(),
            y: tileArg.y() + distance
        });
        tween.play();
    }

    function moveTile(tileArg) {
        if (space.x == (tileArg.x() + 100) && space.y == tileArg.y()) {
            animateX(tileArg, 100);
            space.x -= 100;
        } else if (space.x == (tileArg.x() - 100) && space.y == tileArg.y()) {
            animateX(tileArg, -100);
            space.x += 100;
        } else if (space.y == (tileArg.y() + 100) && space.x == tileArg.x()) {
            animateY(tileArg, 100);
            space.y -= 100;
        } else if (space.y == (tileArg.y() - 100) && space.x == tileArg.x()) {
            animateY(tileArg, -100);
            space.y += 100;
        } else {
            locked.play();
        }
    }

    function fixPuzzle() {
        shuffler.play();
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (i != 2 || j != 2) {
                    var tween = new Konva.Tween({
                        node: tile[(i * 2) + (j + i)],
                        duration: 0.3,
                        x: j * 100,
                        y: i * 100
                    });
                    tween.play();
                }
            }
        }
        space.x = 200;
        space.y = 200;
    }

    function shufflePuzzle() {
        shuffler.play();

        // Assign the new position of Tiles 
        // Verify that the shuffled puzzle can be solved
        do {
            coordinates = shuffle(coordinates);

            for (var i = 0, j = 0; i < 8; i++) {
                if (coordinates[i][0] == 0 && coordinates[i][1] == 0)
                    puzzlePosition[0] = i + 1;
                if (coordinates[i][0] == 100 && coordinates[i][1] == 0)
                    puzzlePosition[1] = i + 1;
                if (coordinates[i][0] == 200 && coordinates[i][1] == 0)
                    puzzlePosition[2] = i + 1;
                if (coordinates[i][0] == 0 && coordinates[i][1] == 100)
                    puzzlePosition[3] = i + 1;
                if (coordinates[i][0] == 100 && coordinates[i][1] == 100)
                    puzzlePosition[4] = i + 1;
                if (coordinates[i][0] == 200 && coordinates[i][1] == 100)
                    puzzlePosition[5] = i + 1;
                if (coordinates[i][0] == 0 && coordinates[i][1] == 200)
                    puzzlePosition[6] = i + 1;
                if (coordinates[i][0] == 100 && coordinates[i][1] == 200)
                    puzzlePosition[7] = i + 1;
            }
        } while (!(isSolvable(puzzlePosition)));


        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (i != 2 || j != 2) {
                    var index = (i * 2) + (j + i);
                    var tween = new Konva.Tween({
                        node: tile[index],
                        duration: 0.3,
                        x: coordinates[index][0],
                        y: coordinates[index][1]
                    });
                    tween.play();
                }
            }
        }

        space.x = 200;
        space.y = 200;
    }

    document.getElementById("fixButton").addEventListener("click", fixPuzzle);
    document.getElementById("shuffleButton").addEventListener("click", shufflePuzzle);

}

var stage = new Konva.Stage({
    container: 'container',
    width: 300,
    height: 300,
});

var layer = new Konva.Layer();

var randomPic = shuffle([0, 1, 2, 3, 4, 5, 6, 7]);

var sources;

if (randomPic[0] == 0) {
    sources = {
        tile0: './images/0.png',
        tile1: './images/1.png',
        tile2: './images/2.png',
        tile3: './images/3.png',
        tile4: './images/4.png',
        tile5: './images/5.png',
        tile6: './images/6.png',
        tile7: './images/7.png'
    };
} else if (randomPic[0] == 1) {
    sources = {
        tile0: './images/tile_01.png',
        tile1: './images/tile_02.png',
        tile2: './images/tile_03.png',
        tile3: './images/tile_04.png',
        tile4: './images/tile_05.png',
        tile5: './images/tile_06.png',
        tile6: './images/tile_07.png',
        tile7: './images/tile_08.png'
    };
} else if (randomPic[0] == 2) {
    sources = {
        tile0: './images/clip_01.png',
        tile1: './images/clip_02.png',
        tile2: './images/clip_03.png',
        tile3: './images/clip_04.png',
        tile4: './images/clip_05.png',
        tile5: './images/clip_06.png',
        tile6: './images/clip_07.png',
        tile7: './images/clip_08.png'
    };
} else if (randomPic[0] == 3) {
    sources = {
        tile0: './images/bug_01.png',
        tile1: './images/bug_02.png',
        tile2: './images/bug_03.png',
        tile3: './images/bug_04.png',
        tile4: './images/bug_05.png',
        tile5: './images/bug_06.png',
        tile6: './images/bug_07.png',
        tile7: './images/bug_08.png'
    };
} else if (randomPic[0] == 4) {
    sources = {
        tile0: './images/falls_01.png',
        tile1: './images/falls_02.png',
        tile2: './images/falls_03.png',
        tile3: './images/falls_04.png',
        tile4: './images/falls_05.png',
        tile5: './images/falls_06.png',
        tile6: './images/falls_07.png',
        tile7: './images/falls_08.png'
    };
} else if (randomPic[0] == 5) {
    sources = {
        tile0: './images/fish_01.png',
        tile1: './images/fish_02.png',
        tile2: './images/fish_03.png',
        tile3: './images/fish_04.png',
        tile4: './images/fish_05.png',
        tile5: './images/fish_06.png',
        tile6: './images/fish_07.png',
        tile7: './images/fish_08.png'
    };
} else {
    sources = {
        tile0: './images/planet_01.png',
        tile1: './images/planet_02.png',
        tile2: './images/planet_03.png',
        tile3: './images/planet_04.png',
        tile4: './images/planet_05.png',
        tile5: './images/planet_06.png',
        tile6: './images/planet_07.png',
        tile7: './images/planet_08.png'
    };
}

// Konva Stage Trigger
loadImages(sources, buildStage);

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function isSolvable(puzzleArr) {
    var inversions = 0;
    for (var i = 0; i < puzzleArr.length; i++) {
        for (var j = i + 1; j < puzzleArr.length; j++) {
            if (puzzleArr[j] > puzzleArr[i]) {
                inversions++;
            }
        }
    }
    return (inversions % 2 == 0);
}