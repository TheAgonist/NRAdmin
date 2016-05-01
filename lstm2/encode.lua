local json = require 'cjson'
local MIDI = require 'MIDI'
local lfs = require 'lfs'
cmd = torch.CmdLine()
cmd:option('-filename', 'File to be transformed')

local notes = {}
notes[0] = 'a'
notes[1] = 'a#'
notes[2] = 'b'
notes[3] = 'c'
notes[4] = 'c#'
notes[5] = 'd'
notes[6] = 'd#'
notes[7] = 'e'
notes[8] = 'f'
notes[9] = 'f#'
notes[10] = 'g'
notes[11] = 'g#'



opt = cmd:parse(arg)

local data ={}
--print(lfs.currentdir())
local f = assert(io.open(opt.filename, "r"))
local rawdata = MIDI.midi2score(f:read("*all"))
if rawdata[3]~=nil then indexer = 3 elseif rawdata[2]~=nil then indexer=2 end
local currnote = 0;
local currlen = 0;
local bpw=0;
local allTime =0;
for i=1, #rawdata[indexer] do
	if rawdata[indexer][i] ~= nil then
        bpw = rawdata[1]*4;
        if rawdata[indexer][i][1]=="note" and rawdata[indexer][i][2]~=0 then
            currnote= currnote+1
            data[currnote]={}
            --print(rawdata[indexer][i])
            local tempIndex = math.abs(
            					math.floor((
            						math.log10(
            							(rawdata[1]*4)/rawdata[indexer][i][3])/math.log10(2)) +0.5
            					)
            				)

            --print(tempIndex.."  "..rawdata[indexer][i][5].." "..rawdata[1].." "..rawdata[indexer][i][3].."   "..(rawdata[1]/4).."  "..math.log10(rawdata[indexer][i][3]/(rawdata[1]/4))/math. log10(2))
            --print(rawdata[indexer][i][5]+ 127*tempIndex.."   "..vocab_mapping[rawdata[indexer][i][5]+ 127*tempIndex])
            --data[1]=3
            --print(math.floor(((rawdata[1]*4)/rawdata[indexer][i][3])+0.5).."   "..rawdata[indexer][i][3].."  "..(rawdata[1]*4))
            
            --print(math.pow(2,tempIndex)
            --	.."   "..rawdata[indexer][i][3].."  "..(rawdata[1]*4).."   "..rawdata[indexer][i][5]%12)
            data[currnote][0] = math.pow(2,tempIndex)..""
            data[currnote][1] = notes[rawdata[indexer][i][5]%12].."/"..math.floor(rawdata[indexer][i][5]/12)
            --print (data[currnote])
            allTime = allTime + data[currnote][0]
            --print(data[currnote][0])
            --print(math.floor(currlen+(rawdata[indexer][i][2] )/(rawdata[1]/4)+1).." "..rawdata[indexer][i][2].."  "..(currlen+(rawdata[indexer][i][2] )/(rawdata[1]/4)+1))
            --data[rawdata]

        end 

      end
    end
--print(allTime.."  "..(allTime%4).."  "..(allTime/4))
print(json.encode(data))
