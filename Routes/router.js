import express from "express";
import passport from "passport";
import { v4 as uuidv4 } from 'uuid';


import { StoriesContent, UserInfo, CommentsContent } from "../models/model.js"
const router = express.Router();


router.get("/isauth", (req, res) => {
    res.json({ isAuth: req.isAuthenticated() })

});
router.get("/memes", async (req, res) => {
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


router.get("/memes/:storyId", async (req, res) => {
    if (req.isAuthenticated()) {

        const sessionUser = req.session.passport.user;
        var fUser = await UserInfo.findOne({ username: sessionUser });
    }
    const Id = req.params.storyId;
    const foundStory = await StoriesContent.findOne({ _id: Id });
    const foundUser = await UserInfo.findOne({ _id: foundStory.userId });
    res.json({ story: foundStory, user: foundUser, sessionUser: (req.isAuthenticated()) ? fUser : "not loggedin" })
});

router.get("/people/:peopleUsername",async (req,res)=>{
    const peopleUsername = req.params.peopleUsername;
    const foundUser = await UserInfo.findOne({ username: peopleUsername });
    var fStories = await StoriesContent.find({ userId: foundUser._id });
    var reversedFstories = fStories.reverse();
    if (req.isAuthenticated()) {

        var sessionUser = req.session.passport.user;
        var fUser = await UserInfo.findOne({ username: sessionUser });

    }

    

    res.json({foundUser:foundUser,fstories:reversedFstories,sessionUser:fUser});
})

router.get("/dash", async (req, res) => {
    try {
        
        if(req.isAuthenticated()){
    
            var sessionUser = req.session.passport.user;
            var fUser = await UserInfo.findOne({ username: sessionUser });
            var dashStories = await StoriesContent.find({ userId: fUser._id });
            var reverseArr = dashStories.reverse()
        }
        res.status(200).json({ myAccount: fUser, myStories: reverseArr });
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


// router.post("/login", function (req, res) {
    
//     const user = new UserInfo({
//         username: req.body.username,
//         password: req.body.password
//     });
//     req.login(user, function (err) {

//         if (err) {
//             res.json(err.message)

//             console.log(err);
//         } else {
//             passport.authenticate("local")(req, res, function () {
//                 console.log("logged in");
//                 res.json({ isAuth: req.isAuthenticated() })
//             })
//         }
//     })
// });

router.post("/login", passport.authenticate("local",{
    failureRedirect: "/login"
}), function(req, res){
    console.log("logged in");
    res.json({ isAuth: req.isAuthenticated() });
});

router.post("/register", (req, res) => {
    
    UserInfo.register({ username: req.body.username,  email: req.body.email }, req.body.password, (err, user) => {
    
        if (err) {
            res.json({msg:err.message})
            console.log(err.message);
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

router.post("/profileinfo", async (req, res) => {
    try {
        const sessionUser = req.session.passport.user


        const respo = await UserInfo.updateOne({ username: sessionUser }, { name:req.body.fullName,profileImgURL:req.body.profileImgURL,instaUsername:req.body.instaUsername,bio:req.body.bio});
        console.log(respo);
        res.json("updated")
    } catch (err) {
        res.json(err)
    }
})

router.post("/followupdate",async (req, res) => {
    try {

        await UserInfo.updateOne({ username: req.body.user }, { followers:req.body.followers});
        await UserInfo.updateOne({username:req.body.sessionUser},{followings:req.body.sFollowings})
        res.json("updated")
    } catch (err) {
        res.json(err)
    }
})

router.post("/editprofile", async (req, res) => {
    try {
        const sessionUser = req.session.passport.user
        if(req.body.imgUrl){

            await UserInfo.updateOne({ username: sessionUser }, { profileImgURL:req.body.imgUrl});
        }else{
            await UserInfo.updateOne({ username: sessionUser }, { name:  req.body.name,email:req.body.email,instaUsername:req.body.instaUsername,bio:req.body.bio });

        }

        res.json("updated edit profile")
    } catch (err) {
        res.json(err.message)
    }
})

router.post("/postviews",async (req,res)=>{
    var no = req.body.views + 1
    await StoriesContent.updateOne({ _id: req.body.storyId }, { views:no });
    res.json("postviews updated")
})

router.delete("/delete", async (req, res) => {
    try {
        
        await StoriesContent.deleteOne({ _id: req.body.Id });
        await CommentsContent.deleteMany({ storyId: req.body.Id })
        res.json("deleted successfully")
    } catch (error) {
        res.json(error.message)
    }
})

router.delete("/deletecomment", async (req, res) => {
    await CommentsContent.deleteOne({ _id: req.body.Id });
    res.json("deleted comment successfully")
})



router.put("/updateStory", async (req, res) => {
    try {

        await StoriesContent.updateOne({ _id: req.body.Id }, { title: req.body.title, content: req.body.content,imageURL:req.body.imageURL });
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
        res.json("reply comment updated")

    } catch (error) {
        res.json(error)

    }
    
})
router.put("/updateLikes", async (req, res) => {
    try {
        

        let sentArray = req.body.likesArray;
        
        await StoriesContent.updateOne({ _id: req.body.storyId }, { likes: sentArray });
        res.json("updatedLikes")
    } catch (err) {
        res.json(err)
    }
})

router.get("/logout", function (req, res) {
    req.logout(function () {
        console.log("logged out");
        res.redirect("https://meme0021.vercel.app")
    });

});

export default router;

