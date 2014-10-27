# Copyright (C) 2010 Mekensleep
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
# Authors:
#  Cedric Pinson <cedric.pinson@plopbyte.net>

FIND_PACKAGE(Blender)

MAKE_DIRECTORY( ${CMAKE_CURRENT_BINARY_DIR}/chassis )

SET ( DATA_SOURCE ${CMAKE_CURRENT_SOURCE_DIR}/template.blend )
SET ( DATA_CHASSIS_TARGET ${CMAKE_CURRENT_BINARY_DIR}/chassis/chassis.osg )
SET ( DATA_CHASSIS_INPUT ${CMAKE_CURRENT_BINARY_DIR}/chassis/template.blend )

ADD_CUSTOM_COMMAND (OUTPUT ${DATA_CHASSIS_TARGET}
  COMMAND cmake  ARGS -E copy_if_different ${DATA_SOURCE} ${DATA_CHASSIS_INPUT}
  COMMAND ${BLENDER_CMD} ARGS -b ${DATA_CHASSIS_INPUT} -P vehicleeditorExport.py --vehicleeditor="what=Chassis\;path=${CMAKE_CURRENT_BINARY_DIR}/"
  WORKING_DIRECTORY ${BLENDER_EXPORTER_DIR}
  DEPENDS ${DATA_SOURCE}
  )
ADD_CUSTOM_TARGET ( SceneChassis ALL
  DEPENDS ${DATA_CHASSIS_TARGET}
)

MAKE_DIRECTORY( ${CMAKE_CURRENT_BINARY_DIR}/items )
SET ( DATA_ITEMS_TARGET ${CMAKE_CURRENT_BINARY_DIR}/items/items.osg )
SET ( DATA_ITEMS_INPUT ${CMAKE_CURRENT_BINARY_DIR}/items/template.blend )

ADD_CUSTOM_COMMAND (OUTPUT ${DATA_ITEMS_TARGET}
  COMMAND cmake  ARGS -E copy_if_different ${DATA_SOURCE} ${DATA_ITEMS_INPUT}
  COMMAND ${BLENDER_CMD} ARGS -b ${DATA_ITEMS_INPUT} -P vehicleeditorExport.py --vehicleeditor="what=items\;path=${CMAKE_CURRENT_BINARY_DIR}/"
  WORKING_DIRECTORY ${BLENDER_EXPORTER_DIR}
  DEPENDS ${DATA_SOURCE}
  )
ADD_CUSTOM_TARGET ( SceneItems ALL
  DEPENDS ${DATA_ITEMS_TARGET}
)
