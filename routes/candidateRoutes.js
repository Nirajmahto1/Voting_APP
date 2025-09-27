const express = require('express')
const router = express.Router()
const Candidate = require('../models/candidate')
const {jwtAuthMiddleware} = require('../jwt')
const User = require('../models/user')





const checkAdminRole =async (userID)=>{
try{
   
    const user = await User.findById(userID)
  
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
module.exports = router