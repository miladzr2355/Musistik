const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const db = require('/Users/miladziai/Documents/skolan/Musistik/db')

//setup multer with error handling
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'views/public/uploads')
    },
    filename: (req, file, callback) =>  {
        callback(null, req.session.userId + "-" + file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
    }
})
const maxSize = 1 * 1024 * 1024 //1MB
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" || 
            file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: { fileSize: maxSize }
})


router.get('/', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn
    const userId = req.session.userId
    const errors = []
    var privatePlaylists = []
    var publicPlaylists = []

    if(isLoggedIn) {
        db.getAllPlaylistsById(userId, function(error, playlists) {
            if(error) {
                errors.push("Error occured when loading playlists, please try again later")
                res.render("library.hbs", {errors: errors})
            } else {
                
                playlists = playlists.filter((playlist) => {
                    playlist.songs = []
                    const duplicates = playlists.filter(innerPlaylist => innerPlaylist.id === playlist.id).length
                    const currentIndex = playlists.findIndex((foundPlaylist) => foundPlaylist && foundPlaylist.id === playlist.id)

                    for(let i = currentIndex; i < currentIndex + duplicates; i++) {
                        playlist.songs.push({
                            songId: playlists[i].songId, 
                            songTitle: playlists[i].songTitle, 
                            artistName: playlists[i].artistName,
                            genre: playlists[i].genre, 
                            releaseDate: playlists[i].releaseDate
                        })
                        
                        if(i === currentIndex) {
                            delete playlist.songId;
                            delete playlist.songTitle;
                            delete playlist.artistName;
                            delete playlist.genre;
                            delete playlist.releaseDate;
                        }
                    }
                    playlists.splice(currentIndex, duplicates-1)

                    return playlist
                })
                
                privatePlaylists = playlists.filter(playlist => playlist.private == 1)
                publicPlaylists = playlists.filter(playlist => playlist.private == 0)

                const model = {
                    privatePlaylists: privatePlaylists,
                    publicPlaylists: publicPlaylists,
                    isLoggedIn: isLoggedIn,
                    userId: userId
                }

                res.render("library.hbs", model)
            }
        })
    } else  
        res.redirect("/signIn")
})

router.get('/nonEmpty', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn
    const userId = req.session.userId
    const errors = []
    var privatePlaylists = []
    var publicPlaylists = []
    if(isLoggedIn) {
        db.getNonEmptyPlaylists(userId, function(error, playlists) {
            if(error) {
                errors.push("Error occured when loading playlists, please try again later")
                res.render("library.hbs", {errors: errors})
            } else {
                playlists = playlists.filter((playlist) => {
                    playlist.songs = []
                    const duplicates = playlists.filter(innerPlaylist => innerPlaylist.id === playlist.id).length
                    const currentIndex = playlists.findIndex((foundPlaylist) => foundPlaylist && foundPlaylist.id === playlist.id)

                    for(let i = currentIndex; i < currentIndex + duplicates; i++) {
                        playlist.songs.push({
                            songId: playlists[i].songId, 
                            songTitle: playlists[i].songTitle, 
                            artistName: playlists[i].artistName,
                            genre: playlists[i].genre, 
                            releaseDate: playlists[i].releaseDate
                        })
                        
                        if(i === currentIndex) {
                            delete playlist.songId;
                            delete playlist.songTitle;
                            delete playlist.artistName;
                            delete playlist.genre;
                            delete playlist.releaseDate;
                        }
                    }
                    playlists.splice(currentIndex, duplicates-1)

                    return playlist
                })
                
                privatePlaylists = playlists.filter(playlist => playlist.private == 1)
                publicPlaylists = playlists.filter(playlist => playlist.private == 0)

                const model = {
                    privatePlaylists: privatePlaylists,
                    publicPlaylists: publicPlaylists,
                    isLoggedIn: isLoggedIn,
                    userId: userId
                }

                res.render("library.hbs", model)
            }
        })
    } else {
        res.redirect("/signIn")
    }
})
router.get('/empty', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn
    const userId = req.session.userId
    const errors = []
    var privatePlaylists = []
    var publicPlaylists = []
    if(isLoggedIn) {
        db.getEmptyPlaylists(userId, function(error, playlists) {
            if(error) {
                errors.push("Error occured when loading playlists, please try again later")
                res.render("library.hbs", {errors: errors})
            } else {
                playlists = playlists.filter((playlist) => {
                    playlist.songs = []
                    const duplicates = playlists.filter(innerPlaylist => innerPlaylist.id === playlist.id).length
                    const currentIndex = playlists.findIndex((foundPlaylist) => foundPlaylist && foundPlaylist.id === playlist.id)

                    for(let i = currentIndex; i < currentIndex + duplicates; i++) {
                        playlist.songs.push({
                            songId: playlists[i].songId, 
                            songTitle: playlists[i].songTitle, 
                            artistName: playlists[i].artistName,
                            genre: playlists[i].genre, 
                            releaseDate: playlists[i].releaseDate
                        })
                        
                        if(i === currentIndex) {
                            delete playlist.songId;
                            delete playlist.songTitle;
                            delete playlist.artistName;
                            delete playlist.genre;
                            delete playlist.releaseDate;
                        }
                    }
                    playlists.splice(currentIndex, duplicates-1)

                    return playlist
                })
                
                privatePlaylists = playlists.filter(playlist => playlist.private == 1)
                publicPlaylists = playlists.filter(playlist => playlist.private == 0)

                const model = {
                    privatePlaylists: privatePlaylists,
                    publicPlaylists: publicPlaylists,
                    isLoggedIn: isLoggedIn,
                    userId: userId
                }

                res.render("library.hbs", model)
            }
        })
    } else {
        res.redirect("/signIn")
    }
})

router.get('/createPlaylist/:id', (req, res) => {
    const userId = req.params.id
    if(!req.session.isLoggedIn)
        res.redirect('/signIn')
    else
        res.render("createPlaylist.hbs", {isLoggedIn: req.session.isLoggedIn, userId})
})
router.post('/createPlaylist', upload.single('playlistImage'), (req, res) => {
    const isLoggedIn = req.session.isLoggedIn
    errors = []
    if(isLoggedIn) {
        let title = req.body.playlistTitle
        let private = req.body.private
        const userId = req.body.userId

        //replace white spaces, new lines and tabs with empty string
        title = title.replace(/\s\s+/g, ' ');

        if(req.file === undefined)
            errors.push("please select an image for the playlist!")

        if(title == ' ' || !title)
            errors.push("please enter a title for the playlist!")

        if(title.length > 25)
            errors.push("title can not be more than 25 characters!")
        
        if(errors.length > 0) {
            res.render("createPlaylist.hbs", {errors, isLoggedIn, userId})
        } else {
            const playlistImage = req.file.filename
            
            if(typeof private === "undefined")
                private = 0
            else
                private = 1

            const model = {
                userId: userId,
                title: title,
                private: private,
                playlistImage: playlistImage,
                playListOwner: userId,
            }
            
            db.createPlaylist(model, function(error) {
                if(error) {
                    errors.push("Error occured when creating playlist, please try again later!")
                    res.render("createPlaylist.hbs", {errors: errors})
                } else {
                    res.redirect("/library")
                }
            })
        }
        
    } else {
        res.redirect("/signIn")
    }
})

router.get('/addSong', (req, res) => {
    const playlistId = req.query.id
    if(!req.session.isLoggedIn)
        res.redirect('/signIn')
    else{
        res.render("addSong.hbs", {isLoggedIn: req.session.isLoggedIn, playlistId: playlistId})
    }
})
router.post('/addSong', (req, res) => {
    const isLoggedIn = req.session.isLoggedIn
    errors = []
    if(isLoggedIn) {
        let title = req.body.title
        let artist = req.body.artist
        let genre = req.body.genre
        const playlistId = req.body.playlistId
        const inputSize = 20
        
        //replace white spaces, new lines and tabs with empty string
        title = title.replace(/\s\s+/g, ' ');
        artist = artist.replace(/\s\s+/g, ' ');
        genre = genre.replace(/\s\s+/g, ' ');

        if(!title || !genre || !artist ||
            title == ' ' || genre == ' ' || artist == ' '){
            errors.push("Please enter title, genre and artist of the song!")
        } 

        if(title.length > inputSize || genre.length > inputSize || artist.length > inputSize){
            errors.push("Inputs can not be more than 20 characters!")
        }

        if(errors.length > 0) {
            res.render("addSong.hbs", {errors, isLoggedIn, playlistId})
        } else {
            const model = {
                title: title,
                artist: artist,
                genre: genre
            }
            db.addSong(model, function(error) {
                if(error) {
                    errors.push("Error occured when creating song, please try again later!")
                    res.render("addSong.hbs", {errors: errors})
                } else {
                    db.getSongId(function(error, songId){
                        if(error){
                            errors.push("Database error, please try again later!")
                            res.render("addSong.hbs", {errors: errors})
                        } else {
                            db.addSongInPlaylist(playlistId, songId.id , function(error){
                                if(error) {
                                    errors.push("Error occured when adding song to playlist!")
                                    res.render("addSong.hbs", {errors: errors})
                                }
                            })
                        }
                    })
                    res.redirect("/library")
                }
            })
        }
    } else {
        res.redirect("/signIn")
    }
})

router.post('/deletePlaylist', (req, res) => {
    const playlistId = req.query.id
    const isLoggedIn = req.session.isLoggedIn
    const userId = req.session.userId
    const errors = []
    var privatePlaylists = []
    var publicPlaylists = []

    if(!playlistId) {
        errors.push("Something went wrong when fethcing the playlist!")
        return res.render("library.hbs", {errors, isLoggedIn})
    }

    if(isLoggedIn) {
        if(userId){
            db.deletePlaylistFromSongsInPlaylist(playlistId, function(error){
                if(error) {
                    errors.push("Error occured when deleting playlist! please try again later")
                    res.render("library.hbs", {errors, isLoggedIn})
                } else {
                    db.deletePlaylistInPlaylist(playlistId, function(error) {
                        if(error) {
                            errors.push("Error occured when deleting playlist! please try again later")
                            res.render("library.hbs", {errors, isLoggedIn})
                        } else {
                            db.getAllPlaylistsById(userId, function(error, playlists) {
                                if(error) {
                                    errors.push("Error occured when loading playlists, please try again later")
                                    res.render("library.hbs", {errors, isLoggedIn})
                                } else {
                    
                                    playlists = playlists.filter((playlist) => {
                                        playlist.songs = []
                                        const duplicates = playlists.filter(innerPlaylist => innerPlaylist.id === playlist.id).length
                                        const currentIndex = playlists.findIndex((foundPlaylist) => foundPlaylist && foundPlaylist.id === playlist.id)
                    
                                        for(let i = currentIndex; i < currentIndex + duplicates; i++) {
                                            playlist.songs.push({
                                                songId: playlists[i].songId, 
                                                songTitle: playlists[i].songTitle, 
                                                artistName: playlists[i].artistName,
                                                genre: playlists[i].genre, 
                                                releaseDate: playlists[i].releaseDate
                                            })
                                            
                                            if(i === currentIndex) {
                                                delete playlist.songId;
                                                delete playlist.songTitle;
                                                delete playlist.artistName;
                                                delete playlist.genre;
                                                delete playlist.releaseDate;
                                            }
                                        }
                                        playlists.splice(currentIndex, duplicates-1)
                    
                                        return playlist
                                    })
                                    
                                    privatePlaylists = playlists.filter(playlist => playlist.private == 1)
                                    publicPlaylists = playlists.filter(playlist => playlist.private == 0)
                    
                                    const model = {
                                        privatePlaylists: privatePlaylists,
                                        publicPlaylists: publicPlaylists,
                                        isLoggedIn: isLoggedIn,
                                        userId: userId
                                    }
                    
                                    res.render("library.hbs", model)
                                }
                            })
                        }
                    })
                }
            })
        } else {
            errors.push("You are not authorized!")
            res.render("library.hbs", {errors, isLoggedIn})
        }
    } else {
        res.redirect('/signIn')
    }
})
router.post('/deleteSongInPlaylist', (req, res) => {
    const songId = req.body.songId
    const errors = []

    if(songId) {
        db.deleteSongInPlaylist(songId, function(error){
            if(error){
                errors.push("Error occured when deleting song!")
                res.render("library.hbs", {errors})
            } else {
                db.deleteSongFromSongsInPlaylist(songId, function(error){
                    if(error){
                        errors.push("Error occured when deleting song!")
                        res.render("library.hbs", {errors})
                    } else {
                        res.redirect("/library")
                    }
                })
            }
        })
    } else {
        errors.push("You are not authorized!")
        res.render("library.hbs", {errors})
    }
    
})


module.exports = router