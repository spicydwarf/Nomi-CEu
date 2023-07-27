**Note: CF uses `style="text-align: center;"` instead of `align="center"`, so Find and Replace that, as the first does not work with GH, and the latter doesn't work in CF.**

***Make sure that you copy into the source code editor of WYSIWYG!***

# Code Begin (use code mode to view what to copy):

<p align="center"><img src="https://github.com/Nomi-CEu/Nomi-CEu/assets/103940576/672808a8-0ad0-4d07-809e-08336a928909" alt="Logo"></p>
<h1 align="center"><b>Nomifactory CEu</b></h1>
<p align="center"><b><i>Fork of <a href="https://github.com/Nomifactory/Nomifactory"> Nomifactory</a>, using <a href="https://github.com/GregTechCEu/GregTech"> GregTech CEu</a> and its related mods.</i></b></p>
<h1 align="center">
    <a href="https://github.com/Nomi-CEu/Nomi-CEu/issues"><img src="https://img.shields.io/github/issues/Nomi-CEu/Nomi-CEu?style=for-the-badge&color=orange" alt="Issues"></a>
    <a href="https://github.com/Nomi-CEu/Nomi-CEu/blob/master/LICENSE"><img src="https://img.shields.io/github/license/Nomi-CEu/Nomi-CEu?style=for-the-badge" alt="License"></a>
    <a href="https://discord.com/invite/zwQzqP8b6q"><img src="https://img.shields.io/discord/927050775073534012?color=5464ec&label=Discord&style=for-the-badge" alt="Discord"></a>
    <br>
    <a href="https://www.curseforge.com/minecraft/modpacks/Nomi-CEu"><img src="https://cf.way2muchnoise.eu/594351.svg?badge_style=for_the_badge" alt="CurseForge"></a>
    <a href="https://www.curseforge.com/minecraft/modpacks/Nomi-CEu"><img src="https://cf.way2muchnoise.eu/versions/For%20MC_594351_all.svg?badge_style=for_the_badge" alt="MC Versions"></a>
    <a href="https://github.com/Nomi-CEu/Nomi-CEu/releases"><img src="https://img.shields.io/github/downloads/Nomi-CEu/Nomi-CEu/total?sort=semver&logo=github&label=&style=for-the-badge&color=2d2d2d&labelColor=545454&logoColor=FFFFFF" alt="GitHub"></a>
</h1>

<h2>Features:</h2>
<ul>
    <li>GregTech Community Edition Unofficial, and its related mods, which are actively developed</li>
    <li> Updated quests, progression and balance changes</li>
    <li> Overhauled circuit progression closely following CEu stock</li>
    <li> Multiblock versions of nearly all machines, including EBF, Freezer and DT, processing up to 256 recipes in parallel</li>
    <li> New processing chains for Naquadah, Advanced SMDs, Crystal Chips, and more</li>
    <li> Fixed lots of unpleasant CE-ness - fixed infinite Amp bug, different ore stone types don't clog up your inventory, etc.</li>
    <li> Super-performant emissive effects on machines, coil blocks, the Fusion Reactor, and more</li>
    <li> Updated questbook to guide you through all the new stuff, including a completely new chapter, the Processing Lines Tab, to give you more info, useful tips and a visual representation of different processing lines, both new and old</li>
    <li>Many QoL features - Wiremill can produce any wire, Creative Tank no longer uses fluids, new creative chests and tanks from CEu, etc.</li>
    <li>And more...</li>
</ul>

<h2>Server Setup and Information</h2>
<p>Details on how to setup a basic server, and some important server admin information, are listed <a href="https://github.com/Nomi-CEu/Nomi-CEu/blob/main/serverfiles/README.md">here</a>.</p>

<h2>Addon Mods</h2>
<p>Nomi-CEu comes with addon scripts for the following mods. You can drop them into the mods folder, and their recipes will be adjusted accordingly.</p>
<ul>
    <li><a href="https://www.curseforge.com/minecraft/mc-mods/ae2-fluid-crafting-rework">AE2 Fluid Crafting Rework</a></li>
    <li><a href="https://www.curseforge.com/minecraft/mc-mods/compact-machines">Compact Machines</a></li>
    <li><a href="https://www.curseforge.com/minecraft/mc-mods/flux-networks">Flux Networks</a></li>
    <li><a href="https://www.curseforge.com/minecraft/mc-mods/lazy-ae2">Lazy AE2</a></li>
    <li><a href="https://www.curseforge.com/minecraft/mc-mods/project-red-illumination">Project Red - Illumination</a></li>
</ul>
<p>* Note: If you are adding these mods via the CurseForge app, remove the extra copy of AE2 (non-extended life), of which it might automatically download.</p>

<h2>Expert Mode</h2>
<p>If you want a harder, or perhaps a more &quot;true&quot; GregTech experience, check out the Expert mode. This pack mode is based on the <a href="https://github.com/NotMyWing/Omnifactory-Self-Torture-Edition">Self-Torture Edition Fork</a> of the original pack. </p>

<h3>Highlights include:</h3>
<ul>
    <li>Forced Peaceful Mode</li>
    <li>No DME for easy infinite resources</li>
    <li>Nomicoins can&#39;t be spent, or obtained</li>
    <li>The Steam Age</li>
    <li>More Focus on GT Power Generation</li>
    <li>No Creative Tank; instead...<ul>
        <li>Stabilized Micro Miners for late-game infinite resources</li>
    </ul></li>
    <li>Harder recipes for assorted things like Iridium, Graphene, Numismatic Dynamos, and more  </li>
</ul>

<h3>Installation Instructions:</h3>
<p>* Note: Scripts will not work on versions &lt;1.6, thus manual installation will be necessary.</p>

<h4>Script Installation Instructions:</h4>
<hr>
<h5>Windows:</h5>
<ul>
    <li>Download the script <a href="https://raw.githubusercontent.com/Nomi-CEu/Nomi-CEu/main/pack-mode-switcher.bat">here</a>, and save it to the root directory of the pack (the same level as <code>\config</code>).</li>
    <li>Run the pack mode switcher in a terminal with <code>./pack-mode-switcher.bat</code></li>
</ul>

<h5>Apple/GNU/Linux:</h5>
<ul>
    <li>Run <code>curl -O https://raw.githubusercontent.com/Nomi-CEu/Nomi-CEu/main/pack-mode-switcher.sh</code> to download the file.</li>
    <li>Verify the contents with your editor of choice.</li>
    <li>Run <code>chmod +x pack-mode-switcher.sh; sh pack-mode-switcher.sh</code> in the pack root directory (the one containing <code>/config</code>).</li>
</ul>
<hr>
<h4>Manual installation instructions are available <a href="https://github.com/Nomi-CEu/Nomi-CEu/blob/main/overrides/README.md">here</a>.</h4>

<h2>Bansoukou</h2>
<p>This pack uses two bansoukou patches. 
The first one is for <a href="https://github.com/tomdodd4598/NuclearCraft/tree/1.12.2">NuclearCraft</a>, and the second one is for <a href="https://github.com/Draconic-Inc/Draconic-Evolution/tree/1.12.2">Draconic Evolution</a>.</p>
<p>The two patch repos are:</p>
<ul>
    <li><a href="https://github.com/Exaxxion/NuclearCraft/tree/2.18y-ceu">NuclearCraft</a>. This fixes GTCEu incompatability with NuclearCraft.</li>
    <li><a href="https://github.com/Nomi-CEu/Draconic-Evolution">Draconic Evolution</a>. This adds the destruct core button, and allows GT blocks in place of DE blocks in the Energy Core and Reactor.</li>
</ul>
<p>If there are issues or crashes with Draconic Evolution, please report them to <a href="https://github.com/Nomi-CEu/Draconic-Evolution/issues">here</a> instead of the main Draconic Evolution repo.</p>

<h2>Credits</h2>
<p>
    Original pack by <a href="https://github.com/Exaxxion">Exaxxion</a>.<br>
    Stabilized miner textures from <a href="https://github.com/NotMyWing/Omnifactory-Self-Torture-Edition">Self-Torture Edition</a>.<br>
    README.md base from <a href="https://github.com/GregTechCEu/GregTech">Gregtech CEu</a>.<br>
    Certain new quests from <a href="https://github.com/GregTechCEu/GregTech-Community-Pack">GregTech Community Pack</a>.<br>
    GTCE item-ID to GTCEu item-ID conversion scripts by <a href="https://github.com/brachy84">brachy84</a>.<br>
    Perfect Gem textures from <a href="http://furfsky.net/">FurfSky Reborn</a>. (<a href="https://ibb.co/bBpksq0">Permission</a> at <a href="https://discord.com/channels/771187253937438762/774353150278369351/938438074503942184">this message</a> in <a href="https://discord.gg/fsr">FurfSky Reborn server</a>).<br>
    Certain hard mode recipe chains and Magnetron texture from <a href="https://github.com/GregTechCEu/gregicality-science">GCY Science</a>.<br>
    Flux Networks compatibility recipes from <a href="https://github.com/smudgerox">smudgerox</a>.<br>
    Thank you!
</p>
