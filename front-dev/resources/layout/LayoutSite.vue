<template>
    <div class="wrapper">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "LayoutSite",
    }
</script>

<style scoped>
    .wrapper {
        height: 100%;
    }
</style>