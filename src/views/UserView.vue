<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/firebase'
import { hashPassword } from '@/utils/crypto'

const allItems = ref([])
const allMembers = ref([])
const loading = ref(true)
const error = ref(null)

// Form Data
const newMemberId = ref('')
const newMemberPassword = ref('')
const newMemberName = ref('')
const newMemberPhone = ref('')

const fetchAllData = async () => {
  loading.value = true
  allItems.value = []
  allMembers.value = []
  error.value = null

  try {
    // Fetch Items
    console.log("Fetching ALL documents from 'items' collection...")
    const itemsSnapshot = await getDocs(collection(db, 'items'))

    if (itemsSnapshot.empty) {
      console.log("Collection 'items' is empty.")
    } else {
      itemsSnapshot.forEach((doc) => {
        console.log('Item:', doc.id, ' => ', doc.data())
        allItems.value.push({ id: doc.id, ...doc.data() })
      })
    }

    // Fetch Members (Single Document 'member/user')
    console.log("Fetching 'member/user' document...")
    const userDocRef = doc(db, 'member', 'user')
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const data = userDocSnap.data()
      console.log('Member Data:', data)

      // Check if userList exists and is an array
      if (data.userList && Array.isArray(data.userList)) {
        allMembers.value = data.userList
      } else {
        console.log("'userList' field is missing or not an array.")
      }
    } else {
      console.log("Document 'member/user' does not exist.")
    }
  } catch (e) {
    console.error('Error fetching documents:', e)
    error.value = 'Error fetching documents: ' + e.message
  } finally {
    loading.value = false
  }
}

const newMemberIdValid = ref(true)
const newMemberPasswordValid = ref(true)
const newMemberNameValid = ref(true)
const newMemberPhoneValid = ref(true)
const newMemberIdExist = ref(false)

const addMember = async () => {
  //console.log("Attempting to add member:", newMemberId.value)
  newMemberIdExist.value = allMembers.value.some((item) => item.id === newMemberId.value)
  //console.log('newMemberIdExist.value', newMemberIdExist.value)
  console.log(newMemberId.value, newMemberPassword.value, newMemberName.value, newMemberPhone.value)
  newMemberIdValid.value = newMemberId.value.length > 0
  newMemberPasswordValid.value = newMemberPassword.value.length > 0
  newMemberNameValid.value = newMemberName.value.length > 0
  newMemberPhoneValid.value = newMemberPhone.value.length > 0

  if (
    !newMemberIdValid.value ||
    !newMemberPasswordValid.value ||
    !newMemberNameValid.value ||
    !newMemberPhoneValid.value
  ) {
    return console.log('value error')
  }
  if (newMemberIdExist.value) {
    return console.log('id error')
  } else {
    newMemberIdExist.value = false
  }

  console.log('Attempting to add member:', newMemberId.value)

  try {
    console.log('Writing to doc: member/user with arrayUnion')

    const hashedPassword = await hashPassword(newMemberPassword.value)

    const newMemberData = {
      id: newMemberId.value,
      password: hashedPassword,
      name: newMemberName.value,
      phone: newMemberPhone.value,
    }

    await setDoc(
      doc(db, 'member', 'user'),
      {
        userList: arrayUnion(newMemberData),
      },
      { merge: true }
    )

    console.log('Write successful')
    //alert("Member added successfully!")
    newMemberId.value = ''
    newMemberPassword.value = ''
    newMemberName.value = ''
    newMemberPhone.value = ''
    newMemberIdValid.value = true
    newMemberPasswordValid.value = true
    newMemberNameValid.value = true
    newMemberPhoneValid.value = true
    console.log('Refreshing data...')
    await fetchAllData() // Refresh list
  } catch (e) {
    console.error('Error adding member:', e)
    alert('Error adding member: ' + e.message)
  }
}

onMounted(() => {
  fetchAllData()
})
</script>

<template>
  <div class="user">
    <h1>Firebase Connection Test</h1>

    <div class="form-section">
      <h2>Add New Member</h2>
      <div class="input-group">
        <div>
          <input
            v-model="newMemberId"
            @blur="
              newMemberIdValid = newMemberId.length > 0
              newMemberIdExist = false
            "
            :class="{ error: !newMemberIdValid || newMemberIdExist }"
            placeholder="Enter ID"
          />
          <p v-if="!newMemberIdValid" class="error-text">ID is required</p>
          <p v-if="newMemberIdExist" class="error-text">ID already exists</p>
        </div>
        <div>
          <input
            v-model="newMemberPassword"
            @blur="newMemberPasswordValid = newMemberPassword.length > 0"
            type="password"
            :class="{ error: !newMemberPasswordValid }"
            placeholder="Enter Password"
          />
          <p v-if="!newMemberPasswordValid" class="error-text">Password is required</p>
        </div>
        <div>
          <input
            v-model="newMemberName"
            @blur="newMemberNameValid = newMemberName.length > 0"
            :class="{ error: !newMemberNameValid }"
            placeholder="Enter Name"
          />
          <p v-if="!newMemberNameValid" class="error-text">Name is required</p>
        </div>
        <div>
          <input
            v-model="newMemberPhone"
            @blur="newMemberPhoneValid = newMemberPhone.length > 0"
            :class="{ error: !newMemberPhoneValid }"
            placeholder="Enter Phone"
          />
          <p v-if="!newMemberPhoneValid" class="error-text">Phone is required</p>
        </div>
        <button @click="addMember">Add Member</button>
      </div>
    </div>

    <button @click="fetchAllData" class="refresh-btn">Refresh Data</button>

    <div v-if="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div class="collection-section">
        <h2>Items Collection ({{ allItems.length }})</h2>
        <ul v-if="allItems.length > 0">
          <li v-for="item in allItems" :key="item.id">
            <strong>ID: {{ item.id }}</strong>
            <pre>{{ item }}</pre>
          </li>
        </ul>
        <p v-else>No items found.</p>
      </div>

      <div class="collection-section">
        <h2>Member List (from member/user)</h2>
        <ul v-if="allMembers.length > 0">
          <li v-for="member in allMembers" :key="member.id">
            <strong>ID: {{ member.id }}</strong>
            <span> / Name: {{ member.name }}</span>
            <span> / Phone: {{ member.phone }}</span>
            <span> / PW (Hash): {{ member.password }}</span>
          </li>
        </ul>
        <p v-else>No members found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
  font-weight: bold;
  padding: 10px;
  border: 1px solid red;
  margin: 10px 0;
}
.error-text {
  color: red;
}
button {
  padding: 5px 10px;
  cursor: pointer;
}
.refresh-btn {
  margin: 10px 0;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
.collection-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}
.form-section {
  background: #f9f9f9;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.input-group {
  display: flex;
  gap: 10px;
}
input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
