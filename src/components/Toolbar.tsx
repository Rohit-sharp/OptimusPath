import { NavigationContext } from "@/pages/Map";
import { NavigationContextType } from "@/utils/types";
import { useContext } from "react";
import { isDesktop } from "react-device-detect";
import EditPositionButton from "./EditPositionButton";
import DesktopRouteDetails from "./DesktopRouteDetails";
import SearchBar from "./SearchBar";
import FloorSelector from "./FloorSelector";
import DirectionSteps from "./DirectionSteps";
import { drawPathForFloor, lastCalculatedRoute } from "@/utils/navigationHelper";

function Toolbar() {
	const { navigation, currentFloor, setCurrentFloor } = useContext(NavigationContext) as NavigationContextType;

	function handleFloorChange(floor: number) {
		setCurrentFloor(floor);
		// redraw path for the new floor if theres an active route
		const route = lastCalculatedRoute;
		if (route) {
			setTimeout(() => {
				drawPathForFloor(route.nodes, floor);
			}, 150);
		}
	}

	return (
		<div className="flex flex-col gap-1 mb-2 relative">
			<div className="flex space-x-1 h-12 items-center">
				<SearchBar />
				<EditPositionButton />
				<FloorSelector currentFloor={currentFloor} onFloorChange={handleFloorChange} />
				{navigation.end && isDesktop && <DesktopRouteDetails />}
			</div>
			{navigation.end && <DirectionSteps onFloorChange={handleFloorChange} />}
		</div>
	);
}

export default Toolbar;
