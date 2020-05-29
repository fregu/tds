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
    <div className={cx('Logotype', className)}>
      <pre>{`                                                   dddddddd`}</pre>
      <pre>{`TTTTTTTTTTTTTTTTTTTTTTT                            d::::::d  iiii`}</pre>
      <pre>{`T:::::::::::::::::::::T                            d::::::d i::::i`}</pre>
      <pre>{`T:::::::::::::::::::::T                            d::::::d  iiii`}</pre>
      <pre>{`T:::::TT:::::::TT:::::T                            d:::::d`}</pre>
      <pre>{`TTTTTT  T:::::T  TTTTTTeeeeeeeeeeee        ddddddddd:::::d iiiiiii    ooooooooooo   uuuuuu    uuuuuu      ssssssssss`}</pre>
      <pre>{`        T:::::T      ee::::::::::::ee    dd::::::::::::::d i:::::i  oo:::::::::::oo u::::u    u::::u    ss::::::::::s`}</pre>
      <pre>{`        T:::::T     e::::::eeeee:::::ee d::::::::::::::::d  i::::i o:::::::::::::::ou::::u    u::::u  ss:::::::::::::s`}</pre>
      <pre>{`        T:::::T    e::::::e     e:::::ed:::::::ddddd:::::d  i::::i o:::::ooooo:::::ou::::u    u::::u  s::::::ssss:::::s`}</pre>
      <pre>{`        T:::::T    e:::::::eeeee::::::ed::::::d    d:::::d  i::::i o::::o     o::::ou::::u    u::::u   s:::::s  ssssss`}</pre>
      <pre>{`        T:::::T    e:::::::::::::::::e d:::::d     d:::::d  i::::i o::::o     o::::ou::::u    u::::u     s::::::s`}</pre>
      <pre>{`        T:::::T    e::::::eeeeeeeeeee  d:::::d     d:::::d  i::::i o::::o     o::::ou::::u    u::::u        s::::::s`}</pre>
      <pre>{`        T:::::T    e:::::::e           d:::::d     d:::::d  i::::i o::::o     o::::ou:::::uuuu:::::u  ssssss   s:::::s`}</pre>
      <pre>{`      TT:::::::TT  e::::::::e          d::::::ddddd::::::ddi::::::io:::::ooooo:::::ou:::::::::::::::uus:::::ssss::::::s`}</pre>
      <pre>{`      T:::::::::T   e::::::::eeeeeeee   d:::::::::::::::::di::::::io:::::::::::::::o u:::::::::::::::us::::::::::::::s`}</pre>
      <pre>{`      T:::::::::T    ee:::::::::::::e    d:::::::::ddd::::di::::::i oo:::::::::::oo   uu::::::::uu:::u s:::::::::::ss`}</pre>
      <pre>{`      TTTTTTTTTTT      eeeeeeeeeeeeee     ddddddddd   dddddiiiiiiii   ooooooooooo       uuuuuuuu  uuuu  sssssssssss`}</pre>
    </div>
  )
}
