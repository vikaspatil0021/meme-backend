import express from "express";
import passport from "passport";
import { v4 as uuidv4 } from 'uuid';


import { StoriesContent, UserInfo, CommentsContent } from "../models/model.js"
const router = express.Router();


router.get("/isauth", (req, res) => {
    res.json({ isAuth: req.isAuthenticated() })

});
router.get("/stories", async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            const sessionUser = req.session.passport.user;
            var fUser = await UserInfo.findOne({ username: sessionUser });
        }

        const storiesAll = await StoriesContent.find();
        res.status(200).json({storiesAll:storiesAll,fUser:fUser});

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
});

router.get("/people", async (req, res) => {
    try {
        const peopleAll = await UserInfo.find();
        res.status(200).json(peopleAll);

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
});


router.get("/stories/:storyId", async (req, res) => {
    if (req.isAuthenticated()) {

        const sessionUser = req.session.passport.user;
        var fUser = await UserInfo.findOne({ username: sessionUser });
    }
    const Id = req.params.storyId;
    const foundStory = await StoriesContent.findOne({ _id: Id });
    const foundUser = await UserInfo.findOne({ _id: foundStory.userId });
    res.json({ story: foundStory, user: foundUser, sessionUser: (req.isAuthenticated()) ? fUser : "not loggedin" })
});

router.get("/dash", async (req, res) => {
    try {
        const sessionUser = req.session.passport.user;
        const fUser = await UserInfo.findOne({ username: sessionUser });
        const dashStories = await StoriesContent.find({ userId: fUser._id })
        res.status(200).json({ myAccount: fUser, myStories: dashStories });

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
});

router.get("/comments/:storyId", async (req, res) => {
    try {
        const foundComments = await CommentsContent.find({ storyId: req.params.storyId });

        res.status(200).json(foundComments);

    } catch (error) {
        res.status(404).json({ message: error.message })
    }
})


router.post("/login", function (req, res) {
    const user = new UserInfo({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                console.log("logged in");
                res.json({ isAuth: req.isAuthenticated() })
            })
        }
    })
});

router.post("/register", (req, res) => {
    UserInfo.register({ username: req.body.username, name: req.body.fullName, email: req.body.email }, req.body.password, (err, user) => {
        if (err) {
            // res.json(err.message)
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                // console.log(req.isAuthenticated());
                res.json({ isAuth: req.isAuthenticated() })

            })
        }
    })
})


router.post("/compose", async (req, res) => {
    const sessionUser = req.session.passport.user
    const foundUser = await UserInfo.findOne({ username: sessionUser });

    const newPost = new StoriesContent({
        userId: foundUser._id,
        title: req.body.title,
        content: req.body.content,
        imageURL: req.body.imageURL

    })
    newPost.save()
    res.json({ message: "Post created" })

})

router.post("/comment", async (req, res) => {
    try {
        const newComment = new CommentsContent({
            storyId: req.body.storyId,
            user: req.body.user,
            content: req.body.content,

        })
        newComment.save()
        res.json({ msg: "Comment saved." })
    } catch (error) {
        res.json({ msg: error.message })

    }

})

router.delete("/delete", async (req, res) => {
    await StoriesContent.deleteOne({ _id: req.body.Id });
    await CommentsContent.deleteMany({ storyId: req.body.Id })
    res.json("deleted successfully")
})

router.delete("/deletecomment", async (req, res) => {
    await CommentsContent.deleteOne({ _id: req.body.Id });
    res.json("deleted comment successfully")
})

router.put("/updateStory", async (req, res) => {
    try {

        await StoriesContent.updateOne({ _id: req.body.Id }, { title: req.body.title, content: req.body.content });
        res.json("updated")
    } catch (err) {
        res.json(err)
    }
})
router.put("/replyComment", async (req, res) => {
    try {
        
        if(req.body.msg=="ADD"){
            const replyArray = req.body.replyArray;
            const replyUpdate = {
                replyId: uuidv4(),
                user: req.body.user,
                content: req.body.content,
            }
            replyArray.push(replyUpdate)
            await CommentsContent.updateOne({ _id: req.body.commentId },{reply:replyArray});

        }else if(req.body.msg==="REMOVE"){
            const foundComment = await CommentsContent.findOne({ _id: req.body.commentId });
            const filteredArray = foundComment.reply.filter((replyComment)=>{
                return replyComment.replyId!== req.body.replyId;
            })
            await CommentsContent.updateOne({ _id: req.body.commentId },{reply:filteredArray});


        }

    } catch (error) {
        res.json(error)

    }
    
})
router.put("/updateLikes", async (req, res) => {
    try {
        const sessionUser = req.session.passport.user
        const foundUser = await UserInfo.findOne({ username: sessionUser });

        let sentArray = req.body.likesArray;
        let result = []
        if (req.body.msg == "add") {
            if (!sentArray.includes(foundUser._id)) {

                sentArray.push(foundUser._id);
                result = [...sentArray]
            }
        } else if (req.body.msg == "remove") {
            // if(sentArray.includes(foundUser._id)){

            result = sentArray.filter(function (ele) {
                return ele != foundUser._id;
            });
            // }
        }
        await StoriesContent.updateOne({ _id: req.body.storyId }, { likes: result });
        res.json("updatedLikes")
    } catch (err) {
        res.json(err)
    }
})

router.get("/logout", function (req, res) {
    req.logout(function () {
        console.log("logged out");
        res.redirect("http://localhost:3000/stories")
    });

});

export default router;

