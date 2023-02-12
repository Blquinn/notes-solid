import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

export interface AppShellProps extends FragmentProps {
    shellClasses?: string
    headerContent?: JSX.Element
    headerClasses?: string
    leftSideBarContent?: JSX.Element
    leftSideBarClasses?: string
    childrenClasses?: string
    pageClasses?: string
}

const cBaseAppShell = 'w-full h-full flex flex-col overflow-hidden';
const cContentArea = 'w-full h-full flex overflow-hidden';
const cPage = 'flex-1 overflow-x-hidden overflow-y-auto flex flex-col';
const cSidebarLeft = 'flex-none overflow-x-hidden overflow-y-auto';
const cSidebarRight = 'flex-none overflow-x-hidden overflow-y-auto';

export default function AppShell(props: AppShellProps) {
    const shellClasses = cBaseAppShell + ' ' + (props.shellClasses ?? '');
    const leftSideBarClasses = cSidebarLeft + ' ' + (props.leftSideBarClasses ?? '');

    return (
        <div id="app-shell" class={shellClasses} data-testid="app-shell">
            <Show when={props.headerContent}>
                <header id="shell-header" class={"flex-none " + props.headerClasses ?? ''}>
                    {props.headerContent}
                </header>
            </Show>

            <div class={"flex-auto " + cContentArea}>
                <Show when={props.leftSideBarContent}>
                    <aside id="sidebar-left" class={leftSideBarClasses}>
                        {props.leftSideBarContent}
                    </aside>
                </Show>

                <div id="page" class={props.pageClasses + ' ' + cPage}>
                    <main id="page-content" class={"flex-auto " + props.childrenClasses ?? ''}>
                        {props.children}
                    </main>
                </div>
            </div>
        </div>
    )
}
