import { ref } from 'vue'
import {projectFirestore} from '../firebase/config'

const useDocument = (collection,id)=>{
    const error = ref(null)
    const isPending = ref(false)
    let documentRef = projectFirestore.collection(collection).doc(id)

    const deleteDoc = async ()=>{
        isPending.value = true

        try {
            const res = await documentRef.delete()
            return res
        } catch (err) {
            error.value = err.message
            
        }
        isPending.value = false

    }

    const updateDoc = async(update)=>{
       isPending.value = true
       
       try {
           const res = await documentRef.update(update)
           return res
       } catch (err) {
           error.value = err.message
           
       }
    }





return{error, deleteDoc, updateDoc }
}

export default useDocument