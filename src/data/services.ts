import type { Service } from "@/types";

/**
 * The service catalogue. Adding an entry here automatically creates:
 *   • a card on the home page and the /services index
 *   • a detail page at /services/[slug]
 *   • a footer link, a dropdown in the contact form and a sitemap entry
 *
 * Copy describes how the work is done. It deliberately contains no prices,
 * guarantees, response-time promises or certifications — add those only once
 * the business confirms them (see TODO markers).
 *
 * Photography: `image.src` is empty on purpose. Drop a real photo into
 * /public/images/services/ and set the path; until then a clearly-marked
 * placeholder frame renders with the shot brief held in `alt`.
 */
export const services: Service[] = [
  {
    slug: "ac-repair",
    name: "AC Repair",
    title: "Air Conditioning Repair",
    summary:
      "Diagnosis and repair for systems that are blowing warm, short-cycling, leaking or refusing to start.",
    icon: "snowflake",
    category: "cooling",
    includes: [
      "Full system diagnosis, not just a parts swap",
      "Refrigerant pressure and superheat/subcool readings",
      "Electrical testing: capacitors, contactors, relays and wiring",
      "Condensate drain clearing and safety-switch check",
      "Written repair options before any work begins",
    ],
    signs: [
      "Air from the vents is warm or barely moving",
      "The outdoor unit hums but the fan does not spin",
      "The system turns on and off every few minutes",
      "Water pooling around the indoor unit",
      "A burning, musty or chemical smell when it runs",
    ],
    body: [
      "Most cooling failures come down to a handful of causes: a failed capacitor, a dirty condenser coil, a blocked condensate line, a tripped safety switch or low refrigerant from a leak. The difference between a cheap repair and an expensive one is usually how carefully the system was diagnosed before anyone reached for a part.",
      "A repair visit starts with the symptoms you describe, then moves to measurements — static pressure, temperature split across the coil, refrigerant pressures and the electrical draw of each motor. Those numbers show whether the fault is the part that failed or something upstream that will kill the new part too.",
      "If your system is losing refrigerant, we look for the leak rather than simply topping it up. Refrigerant is not consumed in normal operation, so a system that needs a recharge every season has a leak that is worth finding.",
    ],
    image: {
      src: "",
      alt: "HVAC technician measuring refrigerant pressures at an outdoor condensing unit with gauges",
      width: 1200,
      height: 800,
    },
    related: ["ac-installation", "maintenance", "thermostats"],
  },
  {
    slug: "ac-installation",
    name: "AC Installation",
    title: "Air Conditioning Installation & Replacement",
    summary:
      "Right-sized replacement systems, installed with the ductwork, airflow and refrigerant charge verified.",
    icon: "wind",
    category: "cooling",
    includes: [
      "Load calculation instead of matching the old nameplate",
      "Duct and airflow assessment before equipment is selected",
      "Removal and responsible disposal of the old system",
      "Line set evaluation, evacuation and correct refrigerant charge",
      "Commissioning readings recorded at start-up",
    ],
    signs: [
      "The system is 12–15+ years old and needs frequent repairs",
      "A repair quote is approaching a large share of replacement cost",
      "Rooms never reach the temperature the thermostat is set to",
      "The system uses R-22, which is no longer produced",
      "Cooling costs keep climbing without a change in habits",
    ],
    body: [
      "An air conditioner performs the way it was installed. Two identical units can differ by a wide margin in comfort and running cost depending on sizing, duct condition, airflow setup and refrigerant charge.",
      "That is why replacement starts with a load calculation for your home — square footage, insulation, window area and orientation — rather than copying the capacity printed on the old unit. Oversized systems short-cycle, leave humidity behind and wear out early.",
      "Before the new equipment is quoted, the existing ductwork is checked for leakage and restriction. Putting efficient equipment on undersized or leaking ducts wastes most of what you paid for. At start-up, airflow, temperature split and charge are measured and recorded so there is proof the system is running to spec.",
      // TODO: add the specific brands installed once confirmed with the business.
    ],
    image: {
      src: "",
      alt: "New outdoor air conditioning condenser installed on a level pad beside a home",
      width: 1200,
      height: 800,
    },
    related: ["ac-repair", "ductwork", "thermostats"],
  },
  {
    slug: "furnace-repair",
    name: "Furnace Repair",
    title: "Furnace & Heating Repair",
    summary:
      "No-heat calls, short-cycling, ignition faults and blower problems on gas, propane and electric furnaces.",
    icon: "flame",
    category: "heating",
    includes: [
      "Ignition, flame sensor and gas valve testing",
      "Heat exchanger inspection for cracks and corrosion",
      "Limit switch, pressure switch and inducer diagnosis",
      "Blower motor and capacitor testing",
      "Carbon monoxide check around the appliance",
    ],
    signs: [
      "The furnace blows cold air or nothing at all",
      "The burner lights then shuts off after a few seconds",
      "Repeated clicking, booming or grinding at start-up",
      "The blower runs constantly and never satisfies the thermostat",
      "A yellow rather than blue burner flame",
    ],
    body: [
      "Heating faults tend to be either ignition-side or airflow-side. Ignition problems show up as a burner that lights and drops out — often a dirty flame sensor, a failing igniter or a pressure switch reacting to a blocked flue. Airflow problems show up as a furnace that overheats and trips its limit switch, usually because of a clogged filter, a failing blower or restricted return air.",
      "Any furnace repair should include a look at combustion safety. A cracked heat exchanger or a blocked flue is a carbon monoxide risk, and it is not something to defer. If we find one, you will be told plainly what was found and what the options are.",
      "If you smell gas, leave the building first and call your gas utility's emergency line from outside. Do not operate switches on your way out.",
    ],
    image: {
      src: "",
      alt: "Technician inspecting the burner assembly inside an open gas furnace cabinet",
      width: 1200,
      height: 800,
    },
    related: ["furnace-installation", "heat-pumps", "maintenance"],
  },
  {
    slug: "furnace-installation",
    name: "Furnace Installation",
    title: "Furnace Installation & Replacement",
    summary:
      "Replacement heating systems sized for your home, with venting and combustion air done to code.",
    icon: "flame",
    category: "heating",
    includes: [
      "Heat-loss calculation for correct sizing",
      "Venting and combustion air brought up to current code",
      "Gas line, electrical and condensate connections",
      "Old equipment removed and disposed of",
      "Combustion analysis at commissioning",
    ],
    signs: [
      "The furnace is past 15–20 years old",
      "Rising repair frequency, or parts are no longer available",
      "Uneven heat between floors or rooms",
      "Rust, soot or cracking visible on the heat exchanger",
      "The unit is noticeably louder than it used to be",
    ],
    body: [
      "Furnace replacement is as much a venting and airflow job as an equipment job. High-efficiency condensing furnaces vent differently from the older equipment they replace, produce acidic condensate that needs a proper drain, and often need a duct transition to match the new blower.",
      "Sizing matters in the same way it does for cooling. A furnace that is too large heats the house in short bursts, leaving temperature swings and cold rooms far from the equipment. A heat-loss calculation puts the capacity where it belongs.",
      "At commissioning, gas pressure, temperature rise and combustion are measured. Those readings confirm the furnace is burning cleanly and moving the air it was designed to move.",
    ],
    image: {
      src: "",
      alt: "Newly installed high-efficiency furnace with PVC venting in a clean basement mechanical room",
      width: 1200,
      height: 800,
    },
    related: ["furnace-repair", "ductwork", "thermostats"],
  },
  {
    slug: "heat-pumps",
    name: "Heat Pumps",
    title: "Heat Pump Repair, Installation & Ductless Systems",
    summary:
      "Air-source and ductless mini-split systems that heat and cool from a single piece of equipment.",
    icon: "heat-pump",
    category: "heating",
    includes: [
      "Heat pump diagnosis including defrost and reversing valve",
      "Ducted and ductless mini-split installation",
      "Auxiliary and backup heat setup and staging",
      "Zoning for additions, garages and finished attics",
      "Controls configured so backup heat does not run unnecessarily",
    ],
    signs: [
      "The system heats weakly in cold weather",
      "Ice builds on the outdoor unit and does not clear",
      "The backup heat strips run almost constantly",
      "A room or addition never matches the rest of the house",
      "The outdoor unit runs but the mode never switches",
    ],
    body: [
      "A heat pump is an air conditioner that can run in reverse, moving heat into the house in winter and out of it in summer. Because it moves heat rather than creating it, it can deliver more heat energy than the electrical energy it consumes.",
      "Most heat pump complaints trace back to controls and staging rather than the equipment itself. If the thermostat is configured to bring on backup electric heat too early, the house stays warm but the bill climbs. Correct staging and balance-point setup usually fixes that.",
      "Ductless mini-splits solve problems ductwork cannot reach: converted garages, additions, sunrooms and older homes with no duct space. Each indoor head is controlled separately, so you are not conditioning rooms nobody is in.",
    ],
    image: {
      src: "",
      alt: "Wall-mounted ductless mini-split indoor head above a window in a finished room",
      width: 1200,
      height: 800,
    },
    related: ["ac-installation", "furnace-installation", "thermostats"],
  },
  {
    slug: "maintenance",
    name: "Maintenance & Tune-Ups",
    title: "Preventive Maintenance & Seasonal Tune-Ups",
    summary:
      "Seasonal inspection and cleaning that catches small faults before they become a no-heat or no-cool call.",
    icon: "wrench",
    category: "maintenance",
    includes: [
      "Coil cleaning and condensate drain clearing",
      "Electrical connections tightened, capacitors tested under load",
      "Refrigerant charge and airflow verified",
      "Burner, igniter and flame sensor cleaned and tested",
      "Filter check and thermostat calibration",
    ],
    signs: [
      "The system has not been serviced in over a year",
      "Utility bills are drifting upward season over season",
      "Airflow feels weaker than it used to",
      "New noises at start-up or shutdown",
      "Dust settling faster than normal after cleaning",
    ],
    body: [
      "Most emergency calls are the end of a slow decline: a capacitor that has been weak for months, a condenser coil that has been getting dirtier every summer, a drain line that has been half-blocked since spring. A maintenance visit is the point where those show up as measurements rather than as a breakdown on the hottest day of the year.",
      "A proper tune-up is mostly cleaning and measuring. Coils get cleaned because heat transfer falls off sharply once they are coated. Capacitors get tested under load because a capacitor can read fine at rest and still fail to start a compressor. Airflow gets measured because almost every efficiency problem is an airflow problem in disguise.",
      "Manufacturers generally require documented annual maintenance to keep equipment warranties valid — check the paperwork for your specific system.",
      // TODO: if the business offers a maintenance plan, add the real terms and price here.
    ],
    image: {
      src: "",
      alt: "Technician cleaning the fins of an outdoor condenser coil during a seasonal tune-up",
      width: 1200,
      height: 800,
    },
    related: ["ac-repair", "furnace-repair", "air-quality"],
  },
  {
    slug: "air-quality",
    name: "Indoor Air Quality",
    title: "Indoor Air Quality Solutions",
    summary:
      "Filtration, ventilation and humidity control for homes with dust, allergy or stuffiness problems.",
    icon: "shield",
    category: "air-quality",
    includes: [
      "Whole-home media filtration sized to your airflow",
      "Humidifiers and dehumidifiers integrated with the system",
      "UV and air purification options where appropriate",
      "Fresh-air ventilation for tightly sealed homes",
      "Filter selection that does not strangle system airflow",
    ],
    signs: [
      "Dust returns within a day or two of cleaning",
      "Allergy symptoms are worse indoors than outside",
      "The house feels clammy in summer or dry in winter",
      "Musty smells when the system starts up",
      "Condensation on windows through the winter",
    ],
    body: [
      "Indoor air quality work is a balance between filtration and airflow. A very dense filter in a system that was not designed for it restricts return air, which lowers capacity, raises energy use and can freeze a coil. The fix is a filter with enough surface area — usually a deeper media cabinet — rather than a thicker one-inch filter.",
      "Humidity is the other half of comfort. Air at 78°F and 45% relative humidity feels better than air at 74°F and 65%, and it costs less to produce. Correct system sizing and run time do most of that work; dedicated dehumidification handles the rest in humid climates.",
      "Tight, well-insulated homes hold pollutants in as effectively as they hold conditioned air. Controlled fresh-air ventilation brings in outdoor air on purpose, filtered and tempered, instead of relying on random leaks.",
    ],
    image: {
      src: "",
      alt: "Clean pleated media air filter being slid into a whole-home filter cabinet",
      width: 1200,
      height: 800,
    },
    related: ["ductwork", "maintenance", "thermostats"],
  },
  {
    slug: "ductwork",
    name: "Ductwork & Sealing",
    title: "Ductwork Repair, Sealing & Design",
    summary:
      "Finding and fixing the leaks and restrictions that keep good equipment from delivering comfortable air.",
    icon: "duct",
    category: "air-quality",
    includes: [
      "Static pressure testing to find restrictions",
      "Leakage inspection at plenums, boots and joints",
      "Sealing with mastic rather than cloth duct tape",
      "Insulating ducts in attics, crawl spaces and garages",
      "Repairs and redesign for rooms that never get enough air",
    ],
    signs: [
      "One or two rooms are always hotter or colder",
      "Weak airflow at registers far from the equipment",
      "Rooms are dusty even with a clean filter",
      "Visible disconnected or crushed flex duct",
      "Whistling or roaring from the return when the fan runs",
    ],
    body: [
      "Duct systems in existing homes commonly leak a meaningful share of the air the equipment moves — often into attics and crawl spaces, where it does nothing for comfort. Sealing that leakage is usually the cheapest capacity you can buy.",
      "Total external static pressure is the duct system's blood pressure. When it is high, the blower cannot move design airflow, and every symptom that follows — weak vents, iced coils, short furnace cycles — is downstream of that one number. Measuring it first keeps a duct problem from being misdiagnosed as an equipment problem.",
      "Where a room simply cannot be satisfied, the fix may be a new run, a larger return or a dedicated ductless head rather than more balancing at the registers.",
    ],
    image: {
      src: "",
      alt: "Sealed and insulated sheet metal supply duct trunk running through a basement ceiling",
      width: 1200,
      height: 800,
    },
    related: ["air-quality", "ac-installation", "maintenance"],
  },
  {
    slug: "thermostats",
    name: "Thermostats & Controls",
    title: "Thermostat & Control Installation",
    summary:
      "Smart and programmable thermostats wired, configured and staged correctly for your equipment.",
    icon: "thermostat",
    category: "maintenance",
    includes: [
      "Compatibility check against your equipment and wiring",
      "C-wire installation where one is missing",
      "Correct configuration for multi-stage and heat pump systems",
      "Schedules and setbacks set up with you",
      "Zoning controls and dampers",
    ],
    signs: [
      "The thermostat display is blank or resets itself",
      "Room temperature does not match the setting",
      "A smart thermostat could not be installed for lack of a C-wire",
      "Backup heat runs whenever the temperature drops slightly",
      "The system will not switch between heating and cooling",
    ],
    body: [
      "A thermostat is a controller, not a thermometer. On multi-stage and heat pump systems its configuration decides when the second stage engages, how long the fan runs after a cycle and when expensive backup heat is allowed to come on. Wrong settings quietly cost money every day.",
      "Most smart thermostats need a common wire for continuous power. Where the existing cable does not have a spare conductor, the options are a new cable, an add-a-wire adapter or a model that does not need one — decided by what is actually in the wall.",
      "Setup includes walking through the schedule with you, because a thermostat that gets overridden every evening is not saving anything.",
    ],
    image: {
      src: "",
      alt: "Smart thermostat mounted on a wall showing the current indoor temperature",
      width: 1200,
      height: 800,
    },
    related: ["heat-pumps", "maintenance", "air-quality"],
  },
  {
    slug: "commercial-hvac",
    name: "Commercial HVAC",
    title: "Light Commercial HVAC Service",
    summary:
      "Rooftop units, split systems and scheduled service for offices, retail and small commercial buildings.",
    icon: "building",
    category: "commercial",
    includes: [
      "Rooftop unit (RTU) service and replacement",
      "Scheduled preventive maintenance visits",
      "Economizer and controls checks",
      "Belt, bearing and filter programmes",
      "Planned replacement so shutdowns are scheduled, not sprung on you",
    ],
    signs: [
      "Uneven temperatures across a floor or between suites",
      "Tenant or customer complaints during peak hours",
      "Units running outside occupied hours",
      "Rising energy costs without a change in occupancy",
      "Equipment nearing the end of its service life",
    ],
    body: [
      "Commercial work is judged on uptime. Equipment that fails during trading hours costs more than the repair itself, so the value of a service programme is in the failures that never happen during business hours.",
      "Scheduled visits cover the parts that wear on a predictable curve — belts, bearings, filters, contactors — plus the economizer, which is one of the most common silent faults on rooftop equipment. A stuck economizer can pull hot outdoor air into a building all summer without anyone noticing anything except the bill.",
      "Where a unit is near end of life, planned replacement lets the work happen after hours and on your schedule.",
      // TODO: confirm which commercial equipment types and building sizes the business takes on.
    ],
    image: {
      src: "",
      alt: "Rows of commercial rooftop HVAC units on a flat roof under a clear sky",
      width: 1200,
      height: 800,
    },
    related: ["maintenance", "ductwork", "ac-installation"],
  },
];

/** Fast lookup used by the dynamic service pages. */
export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getRelatedServices(service: Service): Service[] {
  return service.related
    .map((slug) => getService(slug))
    .filter((s): s is Service => Boolean(s));
}

/** The handful of services featured on the home page. */
export const featuredServiceSlugs = [
  "ac-repair",
  "furnace-repair",
  "ac-installation",
  "heat-pumps",
  "maintenance",
  "air-quality",
];

export const featuredServices = featuredServiceSlugs
  .map((slug) => getService(slug))
  .filter((s): s is Service => Boolean(s));
