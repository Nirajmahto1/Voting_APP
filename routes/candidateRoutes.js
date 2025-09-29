const express = require('express')
const router = express.Router()
const Candidate = require('../models/candidate')
const {jwtAuthMiddleware} = require('../jwt')
const User = require('../models/user')

const checkAdminRole =async (userID)=>{
try{
   
    const user = await User.findById(userID)
    console.log(user.role)
    if(user.role === 'admin'){
        return true;
    }else{
        return false;
    }
}catch(err){
    return false;
}
}
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    try{
    
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message:'User is not a admin'})
        }
        const data = req.body
        const newCandidate = new Candidate(data)
        
        const response = await newCandidate.save()
        console.log('data saved');
        res.status(200).json({response: response})
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }

})


router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message:'User is not a admin'})
        }
        const candidateID = req.params.candidateID
        const updatedCandidateData = req.body
        const response = await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true,
            runValidators:true
        })
        if(!response){
            return res.status(404).json({error:'Candidate Not Found'});
        }
        res.status(200).json(response)
    }catch(err){
          console.error(err)
        res.status(500).json({error:'Internal server Error'})
    }
})
router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message:'User is not a admin'})
        }
        const candidateID = req.params.candidateID
        
        const response = await Candidate.findByIdAndDelete(candidateID)
        if(!response){
            return res.status(404).json({error:'Candidate Not Found'});
        }
        res.status(200).json(response)
    }catch(err){
          console.error(err)
        res.status(500).json({error:'Internal server Error'})
    }
})
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    const candidateID = req.params.candidateID
    userId = req.user.id
    
    try{
        const candidate = await Candidate.findById(candidateID)
        if(!candidate) return res.status(404).json({message:'Candidate Not found'})
        
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({message:'User Not found'})
        if(user.isVoted) return res.status(400).json({message:'User already Voted'})
        if(user.role === 'admin'){
            return res.status(403).json({message:'Admin not allowed'})
        }
        candidate.votes.push({user:userId})
        candidate.voteCount++
        await candidate.save()
        user.isVoted = true
        await user.save()
        return res.status(200).json({message:'Voted Successfully'})
    }catch(err){
        res.status(500).json({message:'Internal Server Error'})
    }
})
router.get('/vote/count',async (req,res)=>{
    try{
        const candidate = await Candidate.find().sort({voteCount:'desc'})
        
       
        const record = candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        })
        return res.status(200).json(record)

    }catch(err){
res.status(500).json({message:'Internal Server Error'})
    
    }
})
router.get('/list',async(req,res)=>{
    try{
    const list = await Candidate.find()
    const record = list.map((data)=>{
        return {
            name:data.name,
            party:data.party
        }
    })
    res.status(200).json(record)
    }catch(err){
        res.status(500).json({message:"Internal Server Error"})
    }
})
module.exports = router