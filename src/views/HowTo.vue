<template>
    <div class="darkmode" id="howtoContainer">
        <h1 id="eclipsetab">eclipseTab</h1>
        <h2 id="whats-new"><a href="https://github.com/Universumgames/eclipseTabs/blob/firefox/Updatelog.md">What's new</a></h2>
        <p><a href="https://github.com/Universumgames/eclipseTabs/blob/firefox/Updatelog.md">Link to Changelog</a></p>
        <h2 id="getting-started">Getting started</h2>
        <p>You have no idea how to use this awesome addon? Then this is the right place for you.</p>
        <p>
            When you are seeing this window the most difficult step is already done. But If you want to hide or closed the sidebar accidentally, just
            look out for this symbol. <br />
            <img alt="sidebar icon" src="../assets/howToImgs/sidebar.png" />
        </p>

        <h2 id="menubar">Menubar</h2>
        <p>
            <img alt="sidebar icon" src="../assets/howToImgs/menuBar.png" /><br />
            The Menu bar consists of five elements: &quot;Create Folder&quot;, &quot;Delete&quot; , &quot;Export&quot;, &quot;Import&quot; and
            &quot;Move&quot;.
        </p>
        <h2 id="creating-a-folder">Creating a folder</h2>
        <p>
            To create a new folder just click on the &quot;Create Folder&quot; icon in the menu bar, an input field wil appear. Type your desired
            name, hit enter and you've successfully created a new folder.
        </p>
        <h2 id="deleting-items-or-folders">Deleting Items or Folders</h2>
        <p>
            To delete a folder or a tab just drag the to-be-deleted Item onto the &quot;trashcan&quot; and the element wil be deleted. If you've
            activated the &quot;Close tabs when deleting folder&quot; entry in the settings menu, all Elements (Tabs) inside the deleted FOlder will
            be closed, &quot;never to be seen again&quot;, so be careful.
        </p>
        <h2 id="exporting-data">Exporting data</h2>
        <p>
            It's recommended to regularly backup your data due to possible data loss because of bugs or an addon update. By clicking on the
            &quot;Export data&quot; icon a new window will open with the corresponding JSON data that can be saved in a file.
        </p>
        <h2 id="importing-data">Importing data</h2>
        <p>
            If you want to restore a backup use the &quot;Import data&quot; icon. A new tab will be opened with an input-field where you can paste the
            backed up json data.<br />
            WARNING all data currently saved will be overwritten when importing other json data.
        </p>
        <h2 id="moving-items">Moving items</h2>
        <p>
            The order of the elements aren't appealing to you? Just click on this icon to change to the view to the rearrange view where all other
            functionality will still be available but new text will appear. &quot;Insert below...&quot; will appear below every Element in the list so
            you change to order of every element, except &quot;Unordered Tabs&quot; and &quot;Pinned Tabs&quot;, by dragging the to-be-moved element
            over the &quot;Insert below...&quot; text. It's just like dragging an element into a folder.
        </p>
        <h2 id="moving-itemsfolders-into-folders">Moving Items/Folders into Folders</h2>
        <p>
            By dragging an Tab or an folder over another folder you can easily created nested folder structures. To move Folders into the root
            directory, just drag the folder into the &quot;Unordered Tabs&quot; folder.
        </p>
        <h2 id="settings">Settings</h2>
        <p>
            To open settings just go to <code>about:addons</code> in a new tab, click on eclipseTab and Preferences. In here you can set various
            settings like &quot;Developer View&quot;, Switch between Light and Dark mode, change the &quot;Deleting folders&quot; behavior and switch
            between hiding tabs rather than switching directly to that tab. To save your new settings and to take affect, just click &quot;Save&quot;
            and switch the current open tab to reload the view.
        </p>
        <h2 id="further-reading">Further Reading</h2>
        <ul>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs">Source Code<external-link /></a>
            </li>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs/blob/vue/Updatelog.md">Changelog<external-link /></a>
            </li>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs/blob/vue/TODOs.md">ToDo list<external-link /></a>
            </li>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs/blob/vue/README.md">Readme<external-link /></a>
            </li>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs/blob/vue/LICENSE">License<external-link /></a>
            </li>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs/blob/vue/howTo.md">Newest version of HowTo<external-link /></a>
            </li>
            <li>
                <a href="https://github.com/Universumgames/eclipseTabs/issues">Report a bug<external-link /></a>
            </li>
        </ul>
    </div>
</template>

<style src="@/assets/style/howTo.css"></style>

<script lang="ts">
import ExternalLink from "@/components/ExternalLink.vue"

export default {
    name: "HowTo",
    components: {
        ExternalLink
    }
}
</script>
