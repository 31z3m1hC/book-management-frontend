
<template>
  <div
    v-if="show"
    class="modal"
    @click="handleBackdrop"
  >
    <div class="modalContent">
      <div class="modalTitle">Confirm Logout</div>
      <div class="modalMessage">Are you sure you want to logout?</div>

      <div class="modalActions">
        <button 
          class="modalButton modalButtonCancel"
          @click.stop="emit('cancel')"
        >
          Cancel
        </button>

        <button 
          class="modalButton modalButtonConfirm"
          @click.stop="emit('confirm')"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { defineProps, defineEmits } from 'vue'

    const props = defineProps({
    show: Boolean
    })

    const emit = defineEmits(['cancel', 'confirm'])

    function handleBackdrop(e) {
    if (e.target.classList.contains('modal')) {
        emit('cancel')
    }
    }
</script>

<style scoped>
    .modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0,0,0,.5);
    z-index: 2000;
    }

    .modalContent {
    background: #fff;
    padding: 35px 25px;
    width: 92%;
    max-width: 400px;
    border-radius: 12px;
    text-align: center;
    }

    .modalTitle {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 10px;
    }

    .modalMessage {
    color: #555;
    margin-bottom: 20px;
    }

    .modalActions {
    display: flex;
    gap: 10px;
    justify-content: center;
    }

    .modalButton {
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    }

    .modalButtonCancel {
    background: #ddd;
    }

    .modalButtonConfirm {
    background: #ffc107;
    }
</style>
