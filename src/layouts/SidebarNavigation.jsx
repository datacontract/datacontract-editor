import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useEditorStore} from "../store.js";
import {useMemo} from 'react';
import * as YAML from 'yaml';
import serverIcons from '../assets/server-icons/serverIcons.jsx';

const SidebarNavigation = () => {
    const yaml = useEditorStore((state) => state.yaml);
    const setYaml = useEditorStore((state) => state.setYaml);
    const setView = useEditorStore((state) => state.setView);
    const currentView = useEditorStore((state) => state.currentView);
    const location = useLocation();
    const navigate = useNavigate();

    // Parse schemas from YAML
    const schemas = useMemo(() => {
        if (!yaml?.trim()) {
            return [];
        }
        try {
            const parsed = YAML.parse(yaml);
            return parsed.schema || [];
        } catch {
            return [];
        }
    }, [yaml]);

    // Parse servers from YAML
    const servers = useMemo(() => {
        if (!yaml?.trim()) {
            return [];
        }
        try {
            const parsed = YAML.parse(yaml);
            return parsed.servers || [];
        } catch {
            return [];
        }
    }, [yaml]);

    // Get colored icon for server type
  const getServerTypeIcon = (type) => {
    if (!type) {
            return serverIcons.custom();
        }

        const IconComponent = serverIcons[type];
    if (IconComponent) {
      return <IconComponent />;
    }

    // Default to custom icon if type not found
    return serverIcons.custom();
    };

    // Add a new schema
    const addSchema = () => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    parsed = {};
                }
            }

            if (!parsed.schema) {
                parsed.schema = [];
            }

            // Add new empty schema
            parsed.schema.push({
                name: '',
                description: '',
                type: 'object',
                properties: []
            });

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);

            // Navigate to the new schema
            navigate(`/schemas/${parsed.schema.length - 1}`);
        } catch (error) {
            console.error('Error adding schema:', error);
        }
    };

    const handleNavigationClick = (e, item) => {
        e.preventDefault();

        switch (currentView) {
            case 'form':
                // Navigate to the form
                navigate(item.path);
                break;
            case 'yaml':
                // For YAML view, try to find and scroll to the section
                try {
                    const yamlPropertyName = item.yamlProperty;
                    if (yamlPropertyName) {
                        // Look for the property in YAML (handles both top-level and nested)
                        const propertyPattern = new RegExp(`^\\s*${yamlPropertyName}:\\s*`, 'm');
                        const match = yaml.match(propertyPattern);
                        if (match) {
                            const lineNumber = yaml.substring(0, match.index).split('\n').length;
                            // Store the line number in navigation state
                            navigate('/yaml', {state: {scrollToLine: lineNumber}});
                        } else {
                            // If not found in YAML, stay in YAML view (don't switch to form)
                            // Just ensure we're on the /yaml route
                            if (location.pathname !== '/yaml') {
                                navigate('/yaml');
                            }
                        }
                    } else {
                        // No YAML property, stay in YAML view
                        if (location.pathname !== '/yaml') {
                            navigate('/yaml');
                        }
                    }
                } catch (error) {
                    console.error('Error finding section in YAML:', error);
                    // Stay in YAML view even on error
                    if (location.pathname !== '/yaml') {
                        navigate('/yaml');
                    }
                }
                break;
            case 'diagram':
                // Switch to form view
                setView('form');
                navigate(item.path);
                break;
            default:
                // Default to form view
                setView('form');
                navigate(item.path);
                break;
        }
    };

    const navigationItems = [
        {
            id: 'overview',
            title: 'Fundamentals',
            path: '/overview',
            yamlProperty: 'info',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" version="1.1">
                    <path
                        d="M3.82416 0.480384C3.440712 0.52128 3.1446 0.6695760000000001 2.844 0.9712320000000001C2.596296 1.219824 2.474664 1.42404 2.399664 1.717344C2.35248 1.9017840000000001 2.352 2.006592 2.352 12C2.352 21.993408000000002 2.35248 22.098216 2.399664 22.282656C2.474664 22.57596 2.596296 22.780176 2.844 23.028768000000003C3.0871920000000004 23.2728 3.2752080000000006 23.385839999999998 3.5890799999999996 23.476728L3.7800000000000002 23.532 12 23.532L20.22 23.532 20.412984 23.476728C20.71224 23.391000000000002 20.932584000000002 23.257224 21.168 23.018256C21.403056 22.779648 21.527304 22.568256 21.600336000000002 22.282656C21.647448 22.098528 21.648 21.997608 21.648 13.74C21.648 5.501784000000001 21.647328 5.381064 21.600672 5.198616C21.534312 4.939128 21.413064000000002 4.7231760000000005 21.193968 4.474200000000001C20.913624 4.155624 17.623992 0.8868 17.479775999999998 0.7835040000000001C17.333616000000003 0.6787920000000001 17.053416 0.546336 16.884 0.5018400000000001C16.78656 0.476232 15.564383999999999 0.469536 10.38 0.466176C6.8688 0.46389600000000003 3.918672 0.470304 3.82416 0.480384M3.919344 2.025912L3.852 2.083848 3.852 12L3.852 21.916152 3.919344 21.974088000000002L3.986688 22.032 12 22.032L20.013312000000003 22.032 20.080656 21.974088000000002L20.148 21.916152 20.154816 13.808088C20.15856 9.348624000000001 20.155152 5.6622 20.147232 5.6160000000000005C20.134848 5.543760000000001 19.888560000000002 5.287296 18.388416 3.784392C17.428992 2.823216 16.61484 2.021304 16.5792 2.0023920000000004C16.523400000000002 1.9728 15.642024 1.968 10.25052 1.968L3.986688 1.968 3.919344 2.025912M6.18 6.581664C5.93652 6.64512 5.701248 6.886824000000001 5.63784 7.138631999999999C5.556984 7.459776000000001 5.728104 7.8261840000000005 6.0344880000000005 7.987871999999999L6.156 8.052 9.616248 8.058311999999999C13.066728 8.064624 13.076880000000001 8.064504000000001 13.209552 8.014848C13.537536 7.892136 13.741176 7.529928000000001 13.677096 7.183272C13.629576 6.926159999999999 13.485792 6.73968 13.248000000000001 6.626712L13.116 6.564 9.696 6.560327999999999C7.38876 6.557832 6.244776000000001 6.564768 6.18 6.581664M6.224256 9.38484C5.996568 9.430223999999999 5.7943679999999995 9.59304 5.690808 9.814392C5.606664 9.994272 5.603904 10.250688 5.6841360000000005 10.430376C5.788896 10.664928 6.021 10.833864 6.292416000000001 10.873128000000001C6.493752 10.902216000000001 17.506248 10.902216000000001 17.707584 10.873128000000001C18.107208 10.815336 18.369816 10.520424 18.371088 10.128C18.37212 9.818496 18.213288 9.569976 17.928 9.434616L17.796 9.372 12.06 9.368472C8.9052 9.366552 6.27912 9.37392 6.224256 9.38484M6.241295999999999 12.19512C6.007752 12.234143999999999 5.787432 12.40836 5.68368 12.636000000000001C5.603376 12.812232 5.6064 13.069728 5.690856 13.248000000000001C5.770392 13.415808 5.904 13.549488 6.072 13.629287999999999L6.204 13.692 12 13.692L17.796 13.692 17.928 13.629287999999999C18.096 13.549488 18.229608 13.415808 18.309144 13.248000000000001C18.394199999999998 13.068456000000001 18.396264 12.81372 18.314088 12.629520000000001C18.244872 12.47436 18.046775999999998 12.286584 17.886864 12.224544C17.7762 12.181632 17.563032 12.17988 12.072000000000001 12.17664C8.740752 12.174672000000001 6.317688 12.182352 6.241295999999999 12.19512M6.0600000000000005 15.069168C5.450928 15.361584 5.479056000000001 16.17444 6.1080000000000005 16.456896C6.1995119999999995 16.497984000000002 6.474744 16.5 12 16.5L17.796 16.5 17.930064 16.43712C18.212856000000002 16.30452 18.372528000000003 16.053696 18.371280000000002 15.744C18.370032000000002 15.434520000000001 18.223536 15.205295999999999 17.94 15.069168L17.796 15.000048 12 15.000048L6.204 15.000048 6.0600000000000005 15.069168M6.104568 17.857968C5.935872 17.92284 5.776464000000001 18.069648 5.695344 18.234863999999998C5.60268 18.423576 5.599008 18.69708 5.686752 18.875376000000003C5.7616559999999994 19.027632 5.908367999999999 19.174344 6.060624000000001 19.249248L6.18 19.308 12 19.308L17.82 19.308 17.939376000000003 19.249248C18.091632 19.174344 18.238344 19.027632 18.313248 18.875376000000003C18.400992 18.69708 18.39732 18.423576 18.304655999999998 18.234863999999998C18.222048 18.066624 18.06288 17.922 17.888640000000002 17.856792000000002C17.758776 17.808216 17.732496 17.808 11.993088 17.809248C6.308496 17.810472 6.226272 17.811168 6.104568 17.857968"
                        stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth="0.024"/>
                </svg>
            ),
            completed: true
        },
        {
            id: 'terms-and-conditions',
            title: 'Terms and Conditions',
            path: '/terms-and-conditions',
            yamlProperty: 'description',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            )
        },
        {
            id: 'schemas',
            title: 'Schemas',
            path: '/schemas',
            yamlProperty: 'schema',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" version="1.1">
                    <path
                        d="M7.836 1.975776C7.6277040000000005 2.05776 7.471176 2.204016 7.38516 2.397072C7.315295999999999 2.553912 7.317264000000001 2.82444 7.3895040000000005 2.9903760000000004C7.451544 3.132864 7.598592 3.284424 7.752 3.363984L7.86 3.42 14.873448 3.432L21.88692 3.444 21.953448 3.510552L22.02 3.5770799999999996 22.032 10.098552000000002L22.044 16.62 22.107936 16.740000000000002C22.190231999999998 16.894488 22.324848 17.023392 22.476 17.092464C22.646808 17.170488000000002 22.93428 17.170512 23.092632000000002 17.092512C23.249304000000002 17.015352 23.393256 16.86792 23.468376000000003 16.70772L23.532 16.572 23.538936 10.152000000000001C23.543496 5.929416 23.53752 3.6534240000000002 23.521512 3.502416C23.476536 3.0783599999999995 23.351448 2.799768 23.068584 2.493672C22.87584 2.285088 22.633608000000002 2.12412 22.370832 2.03004L22.164 1.956 15.036 1.9517280000000001C9.605256 1.9484640000000002 7.8908640000000005 1.9542 7.836 1.975776M4.944 4.89444C4.743696 4.955592 4.560096 5.111016 4.460184 5.304C4.37412 5.4702720000000005 4.368168 5.739624 4.4467680000000005 5.91132C4.527984 6.088728000000001 4.65756 6.225432 4.820136 6.305280000000001L4.956 6.372 11.957328 6.384L18.95868 6.396 19.013328 6.450672000000001L19.068 6.50532 19.080000000000002 13.014672000000001L19.092 19.524 19.147152000000002 19.644000000000002C19.212528000000002 19.786272 19.367664 19.953192 19.496208 20.0196C19.806816 20.180064 20.22288 20.086224 20.435496 19.807752C20.606544 19.58376 20.593272 20.194728 20.586288 12.86292C20.58024 6.506760000000001 20.578295999999998 6.246912 20.535648000000002 6.12C20.437872 5.8289040000000005 20.303112 5.6132159999999995 20.07696 5.38596C19.892784 5.200872 19.825536 5.151096 19.632 5.0566320000000005C19.219968 4.855536 19.896216 4.871736 12.019008 4.874064000000001C8.160744000000001 4.875192 4.977 4.88436 4.944 4.89444M1.728 7.873824000000001C1.4344080000000001 7.9487760000000005 1.215216 8.073648 0.993888 8.292C0.684648 8.597112000000001 0.526416 8.938224 0.47944800000000004 9.40104C0.46096800000000004 9.583128 0.455592 11.28792 0.46140000000000003 15.144C0.470664 21.307416 0.45225600000000005 20.734152 0.654072 21.144000000000002C0.870432 21.583368 1.351896 21.937512 1.858584 22.030032000000002C1.9589520000000002 22.048368 4.101264 22.05612 9.09576 22.056288C16.120008000000002 22.056504 16.192272 22.056024 16.381176 22.008312C16.684584 21.931728 16.902144 21.808968 17.126112 21.588C17.439768 21.278544 17.595816 20.938296 17.640816 20.465784C17.658504 20.280048 17.663832000000003 18.494856000000002 17.657928 14.736C17.648328 8.610912 17.664936 9.138936 17.469552 8.74356C17.271096 8.341944 16.938888000000002 8.068871999999999 16.428 7.887456L16.284 7.836336 9.096 7.832112C2.08596 7.827984 1.903536 7.829016 1.728 7.873824000000001M2.196 9.323688C2.1828000000000003 9.328152000000001 2.141592 9.33852 2.104416 9.346752C1.98144 9.373968 1.968 9.453192 1.968 10.151232L1.968 10.776 9.06 10.776L16.152 10.776 16.152 10.155576C16.152 9.503904 16.139256000000003 9.406080000000001 16.04748 9.353496C16.007136000000003 9.330384 14.505047999999999 9.323088 9.108 9.319776000000001C5.3196 9.317472 2.2092 9.319224 2.196 9.323688M1.968 13.188L1.968 14.088000000000001 4.896 14.088000000000001L7.824 14.088000000000001 7.824 13.188L7.824 12.288 4.896 12.288L1.968 12.288 1.968 13.188M9.312 13.188L9.312 14.088000000000001 10.644 14.088000000000001L11.976 14.088000000000001 11.976 13.188L11.976 12.288 10.644 12.288L9.312 12.288 9.312 13.188M13.488 13.188L13.488 14.088000000000001 14.82 14.088000000000001L16.152 14.088000000000001 16.152 13.188L16.152 12.288 14.82 12.288L13.488 12.288 13.488 13.188M1.968 16.416096L1.968 17.232192 4.89 17.226096000000002L7.812 17.22 7.818312 16.41L7.824648 15.6 4.896312 15.6L1.968 15.6 1.968 16.416096M9.317688 16.41L9.324 17.22 10.65 17.226192L11.976 17.232408000000003 11.976 16.416192000000002L11.976 15.6 10.643688000000001 15.6L9.311352000000001 15.6 9.317688 16.41M13.488 16.416L13.488 17.232 14.82 17.232L16.152 17.232 16.152 16.416L16.152 15.6 14.82 15.6L13.488 15.6 13.488 16.416M1.9683359999999999 19.553904C1.968504 20.012664 1.974936 20.411424 1.982616 20.440032000000002C2.014368 20.558376000000003 1.9527599999999998 20.556 4.98 20.556L7.812 20.556 7.812 19.644000000000002L7.812 18.732 4.89 18.725904L1.968 18.719808 1.9683359999999999 19.553904M9.322944000000001 18.750096C9.316583999999999 18.766656 9.314232 19.179744 9.317688 19.668096000000002L9.324 20.556 10.65 20.562192L11.976 20.568408 11.976 19.644192L11.976 18.72 10.655256 18.72C9.618552000000001 18.72 9.332016 18.72648 9.322944000000001 18.750096M13.488 19.644000000000002L13.488 20.568 14.694 20.567856000000003C15.47196 20.567784 15.932616000000001 20.558664 15.991920000000002 20.542199999999998C16.147488 20.499 16.152 20.47068 16.152 19.536768000000002L16.152 18.72 14.82 18.72L13.488 18.72 13.488 19.644000000000002"
                        stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth="0.024"/>
                </svg>
            )
        },
        {
            id: 'servers',
            title: 'Servers',
            path: '/servers',
            yamlProperty: 'servers',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                </svg>
            )
        },
        {
            id: 'team',
            title: 'Team',
            path: '/team',
            yamlProperty: 'team',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            )
        },
        {
            id: 'support',
            title: 'Support',
            path: '/support',
            yamlProperty: 'support',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            )
        },
        {
            id: 'roles',
            title: 'Roles',
            path: '/roles',
            yamlProperty: 'roles',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            )
        },
        {
            id: 'pricing',
            title: 'Pricing',
            path: '/pricing',
            yamlProperty: 'pricing',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            )
        },
        {
            id: 'sla',
            title: 'SLA',
            path: '/sla',
            yamlProperty: 'slaProperties',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            )
        },
        {
            id: 'custom-properties',
            title: 'Custom Properties',
            path: '/custom-properties',
            yamlProperty: 'customProperties',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            )
        }
    ];

    return (
        <div
            className="w-64 min-h-[calc(100vh-4.1rem)] overflow-y-auto border-r border-gray-300 bg-gray-50 p-4 shrink-0 text-gray-700 font-medium flex flex-col">
            <nav className="flex mt-2 w-full" aria-label="Progress">
                <ol role="list" className="space-y-3 w-full">
                    {navigationItems.map((item) => (
                        <li key={item.id}>
                            {item.id === 'schemas' ? (
                                <div>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => handleNavigationClick(e, item)}
                                        className={`flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2 ${
                                            location.pathname === item.path
                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                        }`}
                                    >
                                        <div className="flex size-4 shrink-0 items-center justify-center"
                                             aria-hidden="true">
                                            {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                        </div>
                                        <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                    </Link>
                                    {schemas.length > 0 && (
                                        <ol className="mt-1 space-y-0.5">
                                            {schemas.map((schema, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={`/schemas/${index}`}
                                                        onClick={(e) => handleNavigationClick(e, {
                                                            path: `/schemas/${index}`,
                                                            yamlProperty: 'schema'
                                                        })}
                                                        className={`flex items-center text-sm py-1 transition-colors -mx-4 pl-10 pr-4 border-l-2 ${
                                                            location.pathname === `/schemas/${index}`
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                                        }`}
                                                    >
                                                        <svg className="w-3 h-3 mr-1.5 shrink-0" fill="currentColor"
                                                             viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5 4a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V6a2 2 0 00-2-2H5zm0 5V6h3v3H5zm7-5a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V6a2 2 0 00-2-2h-3zm0 5V6h3v3h-3zM5 13a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2H5zm0 5v-3h3v3H5zm7-5a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3zm0 5v-3h3v3h-3z" clipRule="evenodd"/>
                                                        </svg>
                                                        {schema.name || schema.businessName || 'Untitled Schema'}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ) : item.id === 'servers' ? (
                                <div>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => handleNavigationClick(e, item)}
                                        className={`flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2 ${
                                            location.pathname === item.path
                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                        }`}
                                    >
                                        <div className="flex size-4 shrink-0 items-center justify-center"
                                             aria-hidden="true">
                                            {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                        </div>
                                        <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                    </Link>
                                    {servers.length > 0 && (
                                        <ol className="mt-1 space-y-0.5">
                                            {servers.filter(server => server).map((server, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={`/servers/${index}`}
                                                        onClick={(e) => handleNavigationClick(e, {
                                                            path: `/servers/${index}`,
                                                            yamlProperty: 'servers'
                                                        })}
                                                        className={`flex items-center gap-1.5 text-xs py-1 transition-colors -mx-4 pl-10 pr-4 border-l-2 ${
                                                            location.pathname === `/servers/${index}`
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                                        }`}
                                                    >
                                                        <span
                                                            className="shrink-0">{getServerTypeIcon(server?.type)}</span>
                                                        <span
                                                            className="flex-1 truncate">{server?.server || `Server ${index + 1}`}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ) : item.path ? (
                                <Link
                                    to={item.path}
                                    onClick={(e) => handleNavigationClick(e, item)}
                                    className={`flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2 ${
                                        location.pathname === item.path
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                            : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                    }`}
                                >
                                    <div className="flex size-4 shrink-0 items-center justify-center"
                                         aria-hidden="true">
                                        {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                    </div>
                                    <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                </Link>
                            ) : (
                                <div className="flex flex-row items-center">
                                    <div className="flex size-4 shrink-0 items-center justify-center"
                                         aria-hidden="true">
                                        {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                    </div>
                                    <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Footer Links */}
            <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                <a
                    href="https://datacontract.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    Documentation
                </a>
                <a
                    href="https://entropy-data.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    Created by Entropy Data
                </a>
            </div>
        </div>
    );
};

export default SidebarNavigation;
