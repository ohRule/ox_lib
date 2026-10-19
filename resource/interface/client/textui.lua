--[[
    https://github.com/overextended/ox_lib

    This file is licensed under LGPL-3.0 or higher <https://www.gnu.org/licenses/lgpl-3.0.en.html>

    Copyright © 2025 Linden <https://github.com/thelindat>
]]

---@class TextUIOptions
---@field position? 'right-center' | 'left-center' | 'top-center' | 'bottom-center';
---@field icon? string | {[1]: IconProp, [2]: string};
---@field iconColor? string;
---@field style? string | table;
---@field alignIcon? 'top' | 'center';

local isOpen = false
local currentText

--- Normalised minimap rect (0-1). The NUI turns this into pixels from its own
--- viewport, so the prompt matches the map instead of the game resolution.
local function minimapAnchor()
    local aspect = GetAspectRatio(false)
    local big = IsBigmapActive()

    -- Same anchor the game uses to draw the radar, including the safe zone.
    SetScriptGfxAlign(string.byte('L'), string.byte('B'))
    local rawX, rawY

    if big then
        rawX, rawY = GetScriptGfxPosition(-0.003975, 0.022 - 0.460416666)
    else
        rawX, rawY = GetScriptGfxPosition(-0.0045, 0.002 - 0.188888)
    end

    ResetScriptGfxAlign()

    local width = big and (1.0 / (2.52 * aspect)) or (1.0 / (4 * aspect))
    local height = big and (1.0 / 2.3374) or (1.0 / 5.674)

    -- Gfx position can come back as 0 before the frame is ready. Fall back to
    -- the safe-zone maths so the prompt still has a place to sit.
    if not rawX or rawX <= 0.0 or not rawY or rawY <= 0.0 then
        local safezone = GetSafeZoneSize()
        local inset = (1.0 / 20.0) * (math.abs(safezone - 1.0) * 10)
        rawX = inset
        rawY = 1.0 - inset - height
    end

    return {
        left = rawX,
        top = rawY,
        width = width,
        height = height,
    }
end

local function pushMinimapAnchor()
    SendNUIMessage({
        action = 'minimapAnchor',
        data = minimapAnchor(),
    })
end

-- The page often loads after the first push, so it can ask again.
RegisterNUICallback('textUiReady', function(_, cb)
    cb(minimapAnchor())
end)

CreateThread(function()
    while true do
        if isOpen then
            pushMinimapAnchor()
            Wait(200)
        else
            Wait(1000)
        end
    end
end)

---@param text string
---@param options? TextUIOptions
function lib.showTextUI(text, options)
    if currentText == text then return end

    if not options then options = {} end

    options.text = text
    currentText = text
    isOpen = true

    pushMinimapAnchor()

    SendNUIMessage({
        action = 'textUi',
        data = options
    })

end

function lib.hideTextUI()
    SendNUIMessage({
        action = 'textUiHide'
    })

    isOpen = false
    currentText = nil
end

---@return boolean, string | nil
function lib.isTextUIOpen()
    return isOpen, currentText
end
