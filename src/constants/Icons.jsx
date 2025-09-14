import { Icon } from '@iconify/react';

export const Icons = {
  workers: (size = 'text-xl', color = 'text-primary-bg') => (
    <Icon icon="mdi:folder-user" className={`${size} ${color}`} />
  ),
  dashboard: (size = 'text-2xl', color = 'text-primary-bg') => (
    <Icon icon="uis:graph-bar" className={`${size} ${color}`} />
  ),
  report: (size = 'text-2xl', color = 'text-primary-bg') => (
    <Icon icon="eos-icons:configuration-file" className={`${size} ${color}`} />
  ),
  transform: (size = 'text-2xl', color = 'text-primary-bg') => (
    <Icon icon="tabler:transform-filled" className={`${size} ${color}`} />
  ),
  close: (size = 'text-2xl', color = 'text-secondary-text') => (
    <Icon icon="gg:close-o" className={`${size} ${color}`} />
  ),
  search: <Icon icon="lets-icons:search" className='text-xl absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none' />,
  unavailable: <Icon icon="gg:unavailable" className='text-2xl text-secondary-text'/>,
  options: <Icon icon='simple-line-icons:options' className='text-2xl text-secondary cursor-pointer'/>,
  read: <Icon icon='flowbite:eye-solid' className='text-xl text-primary'/>,
  edit: <Icon icon='mynaui:edit-solid' className='text-xl text-primary'/>,
  delete: <Icon icon='mdi:delete' className='text-xl text-secondary'/>,
  planification: <Icon icon='mdi:puzzle' className='text-md text-primary'/>,
  workingMemory: <Icon icon='fluent:brain-circuit-20-filled' className='text-xl text-primary'/>,
  flexibilityCognitive: <Icon icon='material-symbols:cognition-rounded' className='text-xl text-primary'/>,
  company: <Icon icon='ic:round-business-center' className='text-xl text-primary'/>,
  position: <Icon icon='material-symbols:id-card-rounded' className='text-xl text-primary'/>,
  menu: <Icon icon='mage:dots-menu' className='text-2xl text-primary-bg'/>,
  dropdown: <Icon icon='iconoir:arrow-down-tag' className='text-2xl text-primary'/>,
  time: <Icon icon='material-symbols:avg-time-rounded' className='text-xl text-secondary'/>,
  aciertos: <Icon icon='mdi:alarm-success' className='text-xl text-primary'/>,
  user: <Icon icon='typcn:user' className='text-2xl text-primary-bg'/>,
  arrowDown: <Icon icon='iconamoon:arrow-down-2' className='text-xl text-primary-text'/>,
  selector: (isSelected) => (
    <div
      className={`rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${
        isSelected
          ? 'bg-primary-bg text-primary shadow-sm'
          : 'bg-primary-bg border p-2 text-primary-bg border-primary-disabled hover:bg-primary-bg hover:border-primary-hover'
        }`}
      >
        {isSelected && <Icon icon="icon-park-solid:check-one" className="text-xl" />}
    </div>
  ),
  info: (isSelected) => (
    <div
      className="inline-block transition-transform duration-300 ease-out transform hover:scale-105 text-secondary"
    >
      <Icon 
        icon={isSelected ? 'mynaui:info-waves-solid' : 'mynaui:info-waves'} 
        className={`text-xl transition-opacity duration-200 
          ${isSelected ? 'opacity-100 scale-100' : 'opacity-80 scale-[0.9]'}`}
      />
    </div>
  ),
  pdf: isActive => (
    <Icon 
        icon={isActive ? 'bi:file-earmark-pdf-fill' : 'bi:file-earmark-pdf'} 
        className={`text-xl ${
          isActive ? 'text-secondary hover:text-secondary-hover' : 'text-secondary/60'
        } transition-colors duration-200`}
    />
  ),
  excel: isActive => (
    <Icon 
        icon={isActive ? 'bi:file-earmark-excel-fill' : 'bi:file-earmark-excel'} 
        className={`text-xl ${
          isActive ? 'text-primary hover:text-primary-hover' : 'text-primary/60'
        } transition-colors duration-200`}
    />
  ),
  word: isActive => (
    <Icon 
        icon={isActive ? 'bi:file-earmark-word-fill' : 'bi:file-earmark-word'} 
        className={`text-xl ${
          isActive ? 'text-high/90 hover:text-high cursor-pointer' : 'text-high/60'
        } transition-colors duration-200`}
    />
  ),
};
