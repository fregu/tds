// @flow
import React from 'react'
import classNames from 'classnames/bind'
import styles from './index.css'
const cx = classNames.bind(styles)

export type Props = {
  className?: string
}
export default function Logotype({ className }: Props) {
  return (
    <pre className={cx('Logotype', className)}>
      {`
                                                   dddddddd
TTTTTTTTTTTTTTTTTTTTTTT                            d::::::d  iiii
T:::::::::::::::::::::T                            d::::::d i::::i
T:::::::::::::::::::::T                            d::::::d  iiii
T:::::TT:::::::TT:::::T                            d:::::d
TTTTTT  T:::::T  TTTTTTeeeeeeeeeeee        ddddddddd:::::d iiiiiii    ooooooooooo   uuuuuu    uuuuuu      ssssssssss
        T:::::T      ee::::::::::::ee    dd::::::::::::::d i:::::i  oo:::::::::::oo u::::u    u::::u    ss::::::::::s
        T:::::T     e::::::eeeee:::::ee d::::::::::::::::d  i::::i o:::::::::::::::ou::::u    u::::u  ss:::::::::::::s
        T:::::T    e::::::e     e:::::ed:::::::ddddd:::::d  i::::i o:::::ooooo:::::ou::::u    u::::u  s::::::ssss:::::s
        T:::::T    e:::::::eeeee::::::ed::::::d    d:::::d  i::::i o::::o     o::::ou::::u    u::::u   s:::::s  ssssss
        T:::::T    e:::::::::::::::::e d:::::d     d:::::d  i::::i o::::o     o::::ou::::u    u::::u     s::::::s
        T:::::T    e::::::eeeeeeeeeee  d:::::d     d:::::d  i::::i o::::o     o::::ou::::u    u::::u        s::::::s
        T:::::T    e:::::::e           d:::::d     d:::::d  i::::i o::::o     o::::ou:::::uuuu:::::u  ssssss   s:::::s
      TT:::::::TT  e::::::::e          d::::::ddddd::::::ddi::::::io:::::ooooo:::::ou:::::::::::::::uus:::::ssss::::::s
      T:::::::::T   e::::::::eeeeeeee   d:::::::::::::::::di::::::io:::::::::::::::o u:::::::::::::::us::::::::::::::s
      T:::::::::T    ee:::::::::::::e    d:::::::::ddd::::di::::::i oo:::::::::::oo   uu::::::::uu:::u s:::::::::::ss
      TTTTTTTTTTT      eeeeeeeeeeeeee     ddddddddd   dddddiiiiiiii   ooooooooooo       uuuuuuuu  uuuu  sssssssssss
`}
    </pre>
  )
}
