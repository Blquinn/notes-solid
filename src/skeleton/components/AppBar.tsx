import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

export interface AppBarProps extends FragmentProps {
    // JSX Children
    children?: JSX.Element;
    headline?: JSX.Element;
    lead?: JSX.Element;
    trail?: JSX.Element;

    class?: string;
	background?: string;
	/** Provide classes to set border styles. */
	border?: string;
	/** Provide classes to set padding. */
	padding?: string;
	/** Provide classes to define a box shadow. */
	shadow?: string;
	/** Provide classes to set the vertical spacing between rows. */
	spacing?: string;
	/** Provide classes to set grid columns for the main row. */
	gridColumns?: string;
	/** Provide classes to set gap spacing for the main row. */
	gap?: string;

	// Props (regions)
	/** Provide abitrary classes to style the top (main) row. */
	regionRowMain?: string;
	/** Provide abitrary classes to style the bottom (headline) row. */
	regionRowHeadline?: string;

	// Props (slots)
	/** Classes to apply to the lead slot container element */
	slotLead?: string;
	/** Classes to apply to the default slot container element */
	slotDefault?: string;
	/** Classes to apply to the trail slot container element */
	slotTrail?: string;

	// Props (a11y)
	/** Provide a semantic ID for the ARIA label. */
	label?: string;
	/** Provide the ID of the element that labels the toolbar. */
	labelledby?: string;
}

// Base Classes
const cBase = 'flex flex-col space-y-4';
// ---
const cRowMain = 'grid items-center'; //  bg-blue-500
const cRowHeadline = ''; //  bg-green-500
// ---
const cSlotLead = 'flex-none flex justify-between items-center';
const cSlotDefault = 'flex-auto';
const cSlotTrail = 'flex-none flex items-center space-x-4';

export default function AppBar(props: AppBarProps) {
	const classesBase = `${cBase} ${props.background ?? 'bg-surface-100-800-token'} ${props.border ?? ''} ${props.spacing ?? 'space-y-4'} ${props.padding ?? 'p-4'} ${props.shadow ?? ''} ${props.class ?? ''}`;
	const classesRowMain = `${cRowMain} ${props.gridColumns ?? 'grid-cols-[auto_1fr_auto]'} ${props.gap ?? 'gap-4'} ${props.regionRowMain}`;
	const classesRowHeadline = `${cRowHeadline} ${props.regionRowHeadline ?? ''}`;
	const classesSlotLead = `${cSlotLead} ${props.slotLead ?? ''}`; // bg-red-500
	const classesSlotDefault = `${cSlotDefault} ${props.slotDefault ?? ''}`; // bg-blue-500
	const classesSlotTrail = `${cSlotTrail} ${props.slotTrail ?? ''}`; // bg-green-500

    return (
        <div class={`app-bar ${classesBase}`} data-testid="app-bar" role="toolbar" aria-label={props.label ?? ''} aria-labelledby={props.labelledby ?? ''}>
            <div class={`app-bar-row-main ${classesRowMain}`}>
                <Show when={props.lead}>
                    <div class={`app-bar-slot-lead ${classesSlotLead}`}>{props.lead}</div>
                </Show>

                <div class={`app-bar-slot-default ${classesSlotDefault}`}>{props.children}</div>

                <Show when={props.trail}>
                    <div class={`app-bar-slot-trail ${classesSlotTrail}`}>{props.trail}</div>
                </Show>
            </div>
            <Show when={props.headline}>
                <div class={`app-bar-row-headline ${classesRowHeadline}`}>{props.headline}</div>
            </Show>
        </div>
    );
}

