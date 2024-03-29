const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./musistik.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

/*------------------------------------------------------*/
/*----------------------User----------------------------*/
/*------------------------------------------------------*/
db.run(`
    CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(26) NOT Null UNIQUE,
        email TEXT NOT Null UNIQUE,
        password VARCHAR(100)
    )
`)

exports.createUserAccount = function(username, email, password, callback) {
    const query = "INSERT INTO User (username, email, password) VALUES(?, ?, ?)"
    const values = [username, email, password]

    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.signIn = function(username, callback) {
    const query = "SELECT * FROM User WHERE username = ?"

    db.all(query, [username], function(error, users) {
        callback(error, users[0])
    })
}

exports.getAllUsers = function(callback) {
    const query = `
                    SELECT u.id, u.username, u.email, p.title, p.image, p.id as playlistId FROM User as u
                    LEFT JOIN Playlist as p
                    ON u.id = p.playlistOwner AND p.private = 0
                    ORDER BY u.id
                `
    db.all(query, function(error, users) {
        callback(error, users)
    })
}

exports.getSearchedUser = function(searchedUser, callback) {
    const query = `
                    SELECT u.id, u.username, u.email, p.title, p.image, p.id as playlistId 
                    FROM User as u
                    LEFT JOIN Playlist as p
                    ON u.id = p.playlistOwner AND p.private = 0
                    WHERE u.username like ?
                    ORDER BY u.id
                `
    db.all(query, [searchedUser], function(error, users) {
        callback(error, users)
    })
}

/*------------------------------------------------------*/
/*----------------------Playlist------------------------*/
/*------------------------------------------------------*/
db.run(`
    CREATE TABLE IF NOT EXISTS Playlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image BLOB,
        private NUMERIC,
        playlistOwner INTEGER,
        FOREIGN KEY(playlistOwner) REFERENCES User(id)
    )
`)

exports.createPlaylist = function(model, callback) {
    const query = "INSERT INTO Playlist (title, image, private, playlistOwner) VALUES(?, ?, ?, ?)"
    const values = [model.title, model.playlistImage, model.private, model.playListOwner]

    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.getAllPlaylistsById = function(userId, callback) {
    const query = `
                    SELECT p.id, p.title, p.image, p.private, p.playlistOwner,
                    sp.id as songsInPlaylistId, sp.playlistId, sp.songId, 
                    s.title as songTitle, s.artistName, s.genre, s.releaseDate
                    FROM Playlist as p
                    LEFT JOIN SongsInPlaylist as sp 
                    ON p.id = sp.playlistId
                    LEFT JOIN Song as s 
                    ON sp.songId = s.id
                    WHERE p.playlistOwner = ?
                    ORDER BY p.id
                `

    db.all(query, [userId], function(error, playlists) {
        callback(error, playlists)
    })
}

exports.getEmptyPlaylists = function(userId, callback) {
    const query = `
                    SELECT p.id, p.title, p.image, p.private, p.playlistOwner,
                    sp.id as songsInPlaylistId, sp.playlistId, sp.songId, 
                    s.title as songTitle, s.artistName, s.genre, s.releaseDate
                    FROM Playlist as p
                    LEFT JOIN SongsInPlaylist as sp 
                    ON p.id = sp.playlistId
                    LEFT JOIN Song as s 
                    ON sp.songId = s.id
                    WHERE p.playlistOwner = ? AND sp.songId IS NULL
                    ORDER BY p.id
                `
    db.all(query, [userId], function(error, playlists) {
        callback(error, playlists)
    })
}

exports.getNonEmptyPlaylists = function(userId, callback) {
    const query = `
                    SELECT p.id, p.title, p.image, p.private, p.playlistOwner,
                    sp.id as songsInPlaylistId, sp.playlistId, sp.songId, 
                    s.title as songTitle, s.artistName, s.genre, s.releaseDate
                    FROM Playlist as p
                    LEFT JOIN SongsInPlaylist as sp 
                    ON p.id = sp.playlistId
                    LEFT JOIN Song as s 
                    ON sp.songId = s.id
                    WHERE p.playlistOwner = ? AND sp.songId IS NOT NULL
                    ORDER BY p.id
                `
    db.all(query, [userId], function(error, playlists) {
        callback(error, playlists)
    })
}

exports.getAllPublicPlaylists = function(offset, callback) {
    const query = `
                    SELECT p.id, p.title, p.image, p.private, p.playlistOwner
                    FROM Playlist as p
                    WHERE p.private = ?
                    ORDER BY p.id
                    LIMIT 9 OFFSET ?
                `
    const values = [0, offset]

    db.all(query, values, function(error, publicPlaylists) {
        callback(error, publicPlaylists)
    })
}

exports.deletePlaylistInPlaylist = function(playlistId, callback) {
    const query = "DELETE FROM Playlist WHERE Playlist.id = ?"

    db.run(query, [playlistId], function(error) {
        callback(error)
    })
}

exports.getLengthOfPublicPlaylists = function(callback){
    const query = "SELECT count(*) FROM Playlist WHERE Playlist.private = ?"

    db.all(query, [0], function(error, length) {
        callback(error, length)
    })
}

/*------------------------------------------------------*/
/*------------------------Song--------------------------*/
/*------------------------------------------------------*/
db.run(`
    CREATE TABLE IF NOT EXISTS Song (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        artistName VARCHAR(26),
        genre TEXT, 
        releaseDate DATE
    )
`)

exports.addSong = function(model, callback) {
    const query = "INSERT INTO Song (title, artistName, genre, releaseDate) VALUES(?,?,?, date('now', 'localtime'))"
    const values = [model.title, model.artist, model.genre]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.getSongId = function(callback) {
    const query = 'SELECT id FROM Song ORDER BY id DESC LIMIT 1'

    db.all(query, function(error, songId){
        callback(error, songId[0])
    })
}

exports.addSongInPlaylist = function(playlistId, songId, callback) {
    const query = "INSERT INTO SongsInPlaylist (playlistId, songId) VALUES(?, ?)"
    const values = [playlistId, songId]

    db.run(query, values, function(error){
        callback(error)
    })
}

exports.getSongsInPlaylistById = function(playlistId, callback) {
    const query = `
                    SELECT sp.id as songsInPlaylistId, sp.playlistId, sp.songId, 
                    s.title as songTitle, s.artistName, s.genre, s.releaseDate, p.title
                    FROM Playlist as p
                    LEFT JOIN SongsInPlaylist as sp 
                    ON p.id = sp.playlistId
                    LEFT JOIN Song as s 
                    ON sp.songId = s.id
                    WHERE p.id = ?
                `
    db.all(query, [playlistId], function(error, songs) {
        callback(error, songs)
    })
}

exports.getAllSongs = function(callback) {
    const query = "SELECT * FROM Song"

    db.all(query, function(error, songs) {
        callback(error, songs)
    })
}

exports.getPopSongs = function(callback) {
    const query = `
                    SELECT * FROM Song as s 
                    WHERE s.genre like 'pop'
                `
    db.all(query, function(error, songs) {
        callback(error, songs)
    })
}

exports.getAkonSongs = function(callback) {
    const query = `
                    SELECT * FROM Song as s 
                    WHERE s.artistName like 'akon'
                `
    db.all(query, function(error, songs) {
        callback(error, songs)
    })
}



/*------------------------------------------------------*/
/*------------------SongsInPlaylist---------------------*/
/*------------------------------------------------------*/
db.run(`
    CREATE TABLE IF NOT EXISTS SongsInPlaylist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlistId INTEGER,
        songId INTEGER,
        FOREIGN KEY(playlistId) REFERENCES Playlist(id),
        FOREIGN KEY(songId) REFERENCES Song(id)
    )
`)

exports.deletePlaylistFromSongsInPlaylist = function(playlistId, callback) {
    const query = "DELETE FROM SongsInPlaylist WHERE SongsInPlaylist.playlistId = ?"

    db.run(query, [playlistId], function(error) {
        callback(error)
    })
}

exports.deleteSongFromSongsInPlaylist = function(songId, playlistId,  callback) {
    const query = "DELETE FROM SongsInPlaylist WHERE SongsInPlaylist.songId = ? AND SongsInPlaylist.playlistId = ?"
    
    db.run(query, [songId, playlistId], function(error){
        callback(error)
    })
}